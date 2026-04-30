// lib/security/engines/unifiedRiskEngine.ts

import { computeRisk } from "./computeRisk";
import { computeUnifiedRisk } from "./computeUnifiedRisk";
import { computeFraudScore } from "./computeFraudScore";
import { computeWhatsAppAbuse } from "./computeWhatsAppAbuse";

import { normalizeIp, normalizeUserAgent } from "@/lib/security/normalize";

import { startSpan, metricsWithContext, log, serviceContext } from "@/lib/core";

import { emitSecurityEvent } from "@/lib/events/emitter";

export interface UnifiedRiskInput {
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;

  riskSignals?: {
    failedLogins?: number;
    newDevice?: boolean;
    ipMismatch?: boolean;
    highVelocity?: boolean;
  };

  unifiedSignals?: Record<string, any>;
  fraudSignals?: string[];

  whatsappAbuse?: {
    reasons: string[];
    count?: number;
    highFrequency?: boolean;
  };

  source?: "login" | "session" | "checkout" | "admin";
}

export interface UnifiedRiskOutput {
  version: number;
  score: number;
  severity: "low" | "medium" | "high";
  confidence: number;
  decision: "allow" | "review" | "block";
  engines: {
    risk?: ReturnType<typeof computeRisk>;
    unified?: Awaited<ReturnType<typeof computeUnifiedRisk>>;
    fraud?: Awaited<ReturnType<typeof computeFraudScore>>;
    whatsapp?: ReturnType<typeof computeWhatsAppAbuse>;
  };
  tags: string[];
}

const VERSION = 1;

function classifyDecision(
  severity: "low" | "medium" | "high",
): "allow" | "review" | "block" {
  if (severity === "high") return "block";
  if (severity === "medium") return "review";
  return "allow";
}

function safeRunSync<T>(name: string, fn: () => T): T | null {
  try {
    return fn();
  } catch (err: any) {
    metricsWithContext.increment(`risk.engine.${name}.error`);
    log.error(`Risk engine failed: ${name}`, {
      error: err?.message ?? String(err),
    });
    return null;
  }
}

async function safeRunAsync<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T | null> {
  try {
    return await fn();
  } catch (err: any) {
    metricsWithContext.increment(`risk.engine.${name}.error`);
    log.error(`Risk engine failed: ${name}`, {
      error: err?.message ?? String(err),
    });
    return null;
  }
}

export async function computeUnifiedSecurityRisk(
  input: UnifiedRiskInput,
): Promise<UnifiedRiskOutput> {
  const span = startSpan("risk.unified_engine", {
    userId: input.userId,
    source: input.source,
  });

  const ctx = serviceContext.get();

  metricsWithContext.increment("risk.unified_engine.calls");

  const ip = normalizeIp(input.ip ?? ctx.ip) ?? null;
  const ua = normalizeUserAgent(input.userAgent ?? ctx.userAgent) ?? null;

  const risk = input.riskSignals
    ? safeRunSync("risk", () => computeRisk(input.riskSignals!))
    : null;

  const unified = input.unifiedSignals
    ? await safeRunAsync("unified", () =>
        computeUnifiedRisk(input.unifiedSignals!, {
          userId: input.userId,
          ip,
          userAgent: ua,
          source: input.source,
        }),
      )
    : null;

  const fraud = input.fraudSignals
    ? await safeRunAsync("fraud", () =>
        computeFraudScore(input.fraudSignals!, {
          userId: input.userId,
          ip,
          userAgent: ua,
        }),
      )
    : null;

  const whatsapp = input.whatsappAbuse
    ? safeRunSync("whatsapp", () => computeWhatsAppAbuse(input.whatsappAbuse!))
    : null;

  const activeEngines = [risk, unified, fraud, whatsapp].filter(Boolean);

  if (activeEngines.length === 0) {
    metricsWithContext.increment("risk.unified_engine.no_signals");
    span.end({
      score: 0,
      severity: "low",
      confidence: 0,
      decision: "allow",
      whatsappReasons: 0,
    });

    return {
      version: VERSION,
      score: 0,
      severity: "low",
      confidence: 0,
      decision: "allow",
      engines: {},
      tags: [],
    };
  }

  const engineScores: number[] = [];
  const engineConfidences: number[] = [];

  if (risk) {
    engineScores.push(risk.score);
    engineConfidences.push(risk.confidence);
  }

  if (unified) {
    engineScores.push(unified.total);
    engineConfidences.push(unified.confidence);
  }

  if (fraud) {
    engineScores.push(fraud.score);
    engineConfidences.push(fraud.confidence);
  }

  if (whatsapp) {
    engineScores.push(whatsapp.score);
    engineConfidences.push(whatsapp.confidence);
    metricsWithContext.increment("risk.unified_engine.whatsapp.used");
    metricsWithContext.increment(
      `risk.unified_engine.whatsapp.reasons.${whatsapp.reasons.length}`,
    );
  }

  const finalScore = Math.min(
    100,
    Math.round(engineScores.reduce((a, b) => a + b, 0) / engineScores.length),
  );

  const severity =
    finalScore >= 70 ? "high" : finalScore >= 40 ? "medium" : "low";

  const confidence = Number(
    (
      engineConfidences.reduce((a, b) => a + b, 0) / engineConfidences.length
    ).toFixed(2),
  );

  const decision = classifyDecision(severity);

  const tags = Array.from(
    new Set([
      ...(risk?.tags ?? []),
      ...(unified?.tags ?? []),
      ...(fraud?.signals?.map((s) => `fraud:${s}`) ?? []),
      ...(whatsapp?.tags ?? []),
    ]),
  );

  const result: UnifiedRiskOutput = {
    version: VERSION,
    score: finalScore,
    severity,
    confidence,
    decision,
    engines: {
      risk: risk ?? undefined,
      unified: unified ?? undefined,
      fraud: fraud ?? undefined,
      whatsapp: whatsapp ?? undefined,
    },
    tags,
  };

  metricsWithContext.increment(`risk.unified_engine.severity.${severity}`);

  await emitSecurityEvent({
    type: "UNIFIED_SECURITY_RISK",
    message: `Unified security risk computed: ${finalScore}`,
    severity,
    actorType: input.userId ? "customer" : "unknown",
    actorId: input.userId ?? null,
    context: input.source ?? "session",
    operation: "evaluate",
    category: "risk",
    tags: ["risk", `risk:${severity}`, `decision:${decision}`, ...tags],
    ip,
    userAgent: ua,
    metadata: {
      version: VERSION,
      score: finalScore,
      severity,
      confidence,
      decision,
      engines: {
        risk,
        unified,
        fraud,
        whatsapp,
      },
      traceId: ctx.traceId,
      requestId: ctx.requestId,
    },
  });

  span.end({
    score: finalScore,
    severity,
    confidence,
    decision,
    whatsappReasons: whatsapp?.reasons?.length ?? 0,
  });

  return result;
}
