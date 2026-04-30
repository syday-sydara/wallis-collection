// app/api/security/sessions/route.ts

import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { forbidden, ok } from "@/lib/api/response";
import { emitSecurityEvent } from "@/lib/events/emitter";

export async function GET() {
  const user = await requireSessionUser();

  // Permission check
  if (!hasPermission(user, "VIEW_SECURITY_SESSIONS")) {
    await emitSecurityEvent({
      type: "PERMISSION_DENIED",
      severity: "medium",
      userId: user.id,
      category: "sessions",
      message: "Attempted to access active sessions without permission",
      source: "api",
    });

    return forbidden("You do not have permission to view active sessions");
  }

  // Fetch active sessions
  const sessions = await prisma.sessionEvent.findMany({
    orderBy: { lastActive: "desc" },
    select: {
      id: true,
      userId: true,
      ip: true,
      deviceType: true,
      deviceId: true,
      lastActive: true,
    },
  });

  // Transform for UI
  const formatted = sessions.map((s) => ({
    userId: s.userId ?? "Unknown",
    ip: s.ip ?? "Unknown",
    device: s.deviceType ?? s.deviceId ?? "Unknown",
    lastActive: s.lastActive,
  }));

  return ok({ sessions: formatted });
}
