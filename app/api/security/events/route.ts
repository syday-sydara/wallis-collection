// app/api/security/events/route.ts

import { prisma } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { forbidden, badRequest, tooManyRequests, ok } from "@/lib/api/response";
import { rateLimited } from "@/lib/api/rate-limited";
import { emitSecurityEvent } from "@/lib/events/emitter";

export async function GET(req: Request) {
  const user = await requireSessionUser();

  /* -------------------------------------------------- */
  /* Permission check                                    */
  /* -------------------------------------------------- */
  if (!hasPermission(user, "VIEW_AUDIT_LOGS")) {
    await emitSecurityEvent({
      type: "PERMISSION_DENIED",
      severity: "medium",
      userId: user.id,
      category: "audit",
      message: "Attempted to access security events without permission",
      source: "api",
    });

    return forbidden("You do not have permission to view security events");
  }

  /* -------------------------------------------------- */
  /* Rate limiting (per admin user)                     */
  /* -------------------------------------------------- */
  const rl = await rateLimited(
    req as any,
    `audit:${user.id}`,
    {
      max: 30,
      windowMs: 60_000,
      namespace: "admin-audit",
      userId: user.id,
      route: "/api/security/events",
    }
  );

  if (rl instanceof Response) {
    await emitSecurityEvent({
      type: "AUTH_RATE_LIMIT",
      severity: "low",
      userId: user.id,
      category: "audit",
      message: "Rate limited while querying security events",
      source: "api",
    });

    return rl;
  }

  /* -------------------------------------------------- */
  /* Parse query params                                  */
  /* -------------------------------------------------- */
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "50");

  if (page <= 0 || pageSize <= 0 || pageSize > 500) {
    return badRequest("Invalid pagination parameters");
  }

  const type = searchParams.get("type") || undefined;
  const severity = searchParams.get("severity") || undefined;
  const userId = searchParams.get("userId") || undefined;

  const from = searchParams.get("from")
    ? new Date(searchParams.get("from")!)
    : undefined;

  const to = searchParams.get("to")
    ? new Date(searchParams.get("to")!)
    : undefined;

  /* -------------------------------------------------- */
  /* Build Prisma filter                                 */
  /* -------------------------------------------------- */
  const where: any = {};

  if (type) where.type = type;
  if (severity) where.severity = severity;
  if (userId) where.userId = userId;

  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = from;
    if (to) where.timestamp.lte = to;
  }

  /* -------------------------------------------------- */
  /* Query events                                        */
  /* -------------------------------------------------- */
  const [events, total] = await Promise.all([
    prisma.securityEvent.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.securityEvent.count({ where }),
  ]);

  /* -------------------------------------------------- */
  /* Log admin access                                    */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "PERMISSION_CHECK",
    severity: "low",
    userId: user.id,
    category: "audit",
    message: `Viewed security events page=${page}, pageSize=${pageSize}`,
    source: "api",
  });

  /* -------------------------------------------------- */
  /* Response                                            */
  /* -------------------------------------------------- */
  return ok({
    events,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}
