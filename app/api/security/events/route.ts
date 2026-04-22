// app/api/security/events/route.ts

import { prisma } from "@/lib/prisma";
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
  /* Parse query params (cursor-based pagination)         */
  /* -------------------------------------------------- */
  const { searchParams } = new URL(req.url);

  const cursor = searchParams.get("cursor") || undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100);

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
  /* Query events (cursor-based pagination)              */
  /* -------------------------------------------------- */
  const events = await prisma.securityEvent.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: limit + 1, // Take one extra to check if there's a next page
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Skip the cursor itself
    }),
  });

  const hasNextPage = events.length > limit;
  const eventsToReturn = hasNextPage ? events.slice(0, -1) : events;
  const nextCursor = hasNextPage ? events[events.length - 1].id : null;

  /* -------------------------------------------------- */
  /* Log admin access                                    */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "PERMISSION_CHECK",
    severity: "low",
    userId: user.id,
    category: "audit",
    message: `Viewed security events cursor=${cursor || 'first'}, limit=${limit}`,
    source: "api",
  });

  /* -------------------------------------------------- */
  /* Response                                            */
  /* -------------------------------------------------- */
  return ok({
    events: eventsToReturn,
    nextCursor,
    hasNextPage,
    limit,
  });
}
