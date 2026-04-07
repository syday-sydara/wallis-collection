// app/api/security/metrics/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Count all security events
    const totalEvents = await prisma.securityEvent.count();

    // Count unique users who triggered events
    const totalUsers = await prisma.securityEvent.groupBy({
      by: ["userId"],
      where: { userId: { not: null } },
    });

    // Alerts in the last 24 hours
    const alerts = await prisma.alertEvent.count({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json({
      totalEvents,
      totalUsers: totalUsers.length,
      alerts,
    });
  } catch (err) {
    console.error("[SecurityMetrics] Failed:", err);
    return NextResponse.json(
      { totalEvents: 0, totalUsers: 0, alerts: 0 },
      { status: 500 }
    );
  }
}
