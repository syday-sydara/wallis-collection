import { prisma } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { badRequest, forbidden, tooManyRequests, ok } from "@/lib/api/response";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { logSecurityEvent } from "@/lib/security/log";

export async function GET(req: Request) {
  const user = await requireSessionUser();

  if (!hasPermission(user, "VIEW_AUDIT_LOGS")) {
    await logSecurityEvent({
      userId: user.id,
      type: "ADMIN_FORBIDDEN_AUDIT_LOGS",
      severity: "medium",
      message: "Attempted to access security events without permission"
    });

    return forbidden("You do not have permission to view security events");
  }

  // Rate-limit per admin user
  const rate = checkRateLimit(`audit:${user.id}`, 30, 60_000);
  if (!rate.allowed) {
    await logSecurityEvent({
      userId: user.id,
      type: "ADMIN_RATE_LIMITED_AUDIT_LOGS",
      severity: "low",
      message: "Rate limited while querying security events"
    });

    return tooManyRequests("Too many audit log requests");
  }

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

  const where: any = {};

  if (type) where.type = type;
  if (severity) where.severity = severity;
  if (userId) where.userId = userId;

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  const [events, total] = await Promise.all([
    prisma.securityEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, email: true } }
      }
    }),
    prisma.securityEvent.count({ where })
  ]);

  await logSecurityEvent({
    userId: user.id,
    type: "ADMIN_VIEW_AUDIT_LOGS",
    severity: "low",
    message: `Viewed security events page=${page}, pageSize=${pageSize}`
  });

  return ok({
    events,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize)
  });
}