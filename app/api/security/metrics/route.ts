// app/api/security/metrics/route.ts
import { prisma } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await requireSessionUser();

  if (!hasPermission(user, "VIEW_SECURITY_CENTER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [events, users] = await Promise.all([
    prisma.securityEvent.count(),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    totalEvents: events,
    totalUsers: users,
  });
}