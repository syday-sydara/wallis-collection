// app/api/security/events/route.ts

import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { forbidden } from "@/lib/api/response";
import { rateLimited } from "@/lib/api/rate-limited";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { ok } from "@/lib/api/response";

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
  /* Rate limiting                                       */
  /* -------------------------------------------------- */
  const rl = await rateLimited(req as any, `audit:${user.id}`, {
    max: 30,
    windowMs: 60_000,
    namespace: "admin-audit",
    userId: user.id,
    route: "/api/security/events",
  });

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

  const cursor = searchParams.get("cursor") || undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100);

  const type = searchParams.get("type") || undefined;
  const severity = searchParams.get("severity") || undefined;
  const actorId = searchParams.get("actorId") || undefined;
  const category = searchParams.get("category") || undefined;

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
  if (actorId) where.actorId = actorId;
  if (category) where.category = category;

  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = from;
    if (to) where.timestamp.lte = to;
  }

  /* -------------------------------------------------- */
  /* Decode cursor (timestamp__id)                       */
  /* -------------------------------------------------- */
  let cursorObj:
    | { timestamp: Date; id: string }
    | undefined;

  if (cursor) {
    const [ts, id] = cursor.split("__");
    cursorObj = {
      timestamp: new Date(Number(ts)),
      id,
    };
  }

  /* -------------------------------------------------- */
  /* Query events (composite cursor pagination)          */
  /* -------------------------------------------------- */
  const events = await prisma.securityEvent.findMany({
    where,
    take: limit + 1,
    orderBy: [
      { timestamp: "desc" },
      { id: "desc" },
    ],
    ...(cursorObj && {
      cursor: cursorObj,
      skip: 1,
    }),
  });

  const hasNextPage = events.length > limit;
  const eventsToReturn = hasNextPage ? events.slice(0, -1) : events;

  const nextCursor = hasNextPage
    ? `${events[limit - 1].timestamp.getTime()}__${events[limit - 1].id}`
    : null;

  /* -------------------------------------------------- */
  /* Log admin access                                    */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "PERMISSION_CHECK",
    severity: "low",
    userId: user.id,
    category: "audit",
    message: `Viewed security events cursor=${cursor || "first"}, limit=${limit}`,
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
