// app/api/security/risk-distribution/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { forbidden } from "@/lib/api/response";
import { emitSecurityEvent } from "@/lib/events/emitter";

export async function GET() {
  const user = await requireSessionUser();

  // Permission check
  if (!hasPermission(user, "VIEW_RISK_ANALYTICS")) {
    await emitSecurityEvent({
      type: "PERMISSION_DENIED",
      severity: "medium",
      userId: user.id,
      category: "risk",
      message: "Attempted to access risk distribution without permission",
      source: "api",
    });

    return forbidden("You do not have permission to view risk analytics");
  }

  try {
    // Count by risk level
    const [low, medium, high] = await Promise.all([
      prisma.riskEvent.count({ where: { level: "LOW" } }),
      prisma.riskEvent.count({ where: { level: "MEDIUM" } }),
      prisma.riskEvent.count({ where: { level: "HIGH" } }),
    ]);

    return NextResponse.json({ low, medium, high });
  } catch (err) {
    console.error("[RiskDistribution] Failed:", err);
    return NextResponse.json({ low: 0, medium: 0, high: 0 });
  }
}
