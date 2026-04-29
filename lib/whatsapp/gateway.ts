// lib/whatsapp/gateway.ts

import { withSpan } from "@/lib/core/with-span";
import { log } from "@/lib/core/log";
import { metricsWithContext } from "@/lib/core/metrics-context";
import { serviceContext } from "@/lib/core/service-context";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";
import { normalizePhoneForWhatsApp } from "@/lib/utils/formatters/phone";
import { WhatsAppTransport, WhatsAppResult } from "./transport";

export type WhatsAppOperation =
  | "text"
  | "template"
  | "buttons"
  | "list"
  | "media_image"
  | "media_document";

interface SendWhatsAppOptions {
  to: string;
  operation: WhatsAppOperation;
  tags: string[];
  buildBody: (normalizedTo: string) => any;
}

export async function sendWhatsApp({
  to,
  operation,
  tags,
  buildBody,
}: SendWhatsAppOptions): Promise<WhatsAppResult> {
  return withSpan(`whatsapp.${operation}`, async () => {
    const ctx = serviceContext.get();
    const normalized = normalizePhoneForWhatsApp(to);

    // -----------------------------------------------------------------------
    // INVALID PHONE NUMBER
    // -----------------------------------------------------------------------
    if (!normalized) {
      metricsWithContext.increment("whatsapp.invalid_number");

      await emitSecurityEvent({
        kind: "security",
        type: "WHATSAPP_INVALID_NUMBER",
        message: `Invalid WhatsApp number: ${to}`,
        severity: "medium",
        tags: ["whatsapp", "invalid_number", ...tags],
        metadata: { raw: to, operation, ...ctx },
        source: EventSource.WhatsAppAPI,
      });

      return { ok: false, error: "api_error" };
    }

    metricsWithContext.increment(`whatsapp.${operation}.attempt`);

    const body = buildBody(normalized);
    const result = await WhatsAppTransport.call(normalized, body);

    // -----------------------------------------------------------------------
    // SUCCESS
    // -----------------------------------------------------------------------
    if (result.ok) {
      metricsWithContext.increment(`whatsapp.${operation}.success`);

      log.info(`WhatsApp ${operation} sent`, {
        to: normalized,
        attempt: result.attempt,
      });

      await emitSecurityEvent({
        kind: "security",
        type: "WHATSAPP_MESSAGE_SENT",
        message: `WhatsApp ${operation} sent to ${normalized}`,
        severity: "low",
        tags: ["whatsapp", "sent", ...tags],
        metadata: {
          to: normalized,
          operation,
          attempt: result.attempt,
          ...ctx,
        },
        source: EventSource.WhatsAppAPI,
      });

      return result;
    }

    // -----------------------------------------------------------------------
    // FAILURE
    // -----------------------------------------------------------------------
    metricsWithContext.increment(`whatsapp.${operation}.failure`);

    log.warn(`WhatsApp ${operation} failed`, {
      to: normalized,
      error: result.error,
      status: result.status,
      attempt: result.attempt,
    });

    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_MESSAGE_SEND_FAILED",
      message: `Failed to send WhatsApp ${operation} to ${normalized}`,
      severity:
        result.error === "network_error" ||
        (result.status && result.status >= 500)
          ? "high"
          : "medium",
      tags: ["whatsapp", "send_failed", ...tags],
      metadata: {
        to: normalized,
        status: result.status,
        error: result.raw ?? result.error,
        operation,
        attempt: result.attempt,
        ...ctx,
      },
      source: EventSource.WhatsAppAPI,
    });

    // -----------------------------------------------------------------------
    // RATE LIMIT
    // -----------------------------------------------------------------------
    if (result.error === "rate_limited") {
      metricsWithContext.increment("whatsapp.rate_limited");
    }

    // -----------------------------------------------------------------------
    // NETWORK / SERVER FAILURE → ALERT
    // -----------------------------------------------------------------------
    if (
      result.error === "network_error" ||
      result.error === "circuit_open" ||
      (result.status ?? 0) >= 500
    ) {
      await emitAlertEvent({
        kind: "alert",
        event: "ALERT_WHATSAPP_UNRELIABLE",
        severity: "high",
        metadata: {
          to: normalized,
          operation,
          status: result.status,
          raw: result.raw,
          attempt: result.attempt,
          ...ctx,
        },
        source: EventSource.WhatsAppAPI,
      });
    }

    return result;
  });
}
