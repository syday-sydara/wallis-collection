// app/api/security/devices/route.ts

import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { forbidden, ok } from "@/lib/api/response";
import { emitSecurityEvent } from "@/lib/events/emitter";

export async function GET() {
  const user = await requireSessionUser();

  // Permission check
  if (!hasPermission(user, "VIEW_SECURITY_DEVICES")) {
    await emitSecurityEvent({
      type: "PERMISSION_DENIED",
      severity: "medium",
      userId: user.id,
      category: "devices",
      message: "Attempted to access device list without permission",
      source: "api",
    });

    return forbidden("You do not have permission to view devices");
  }

  // Fetch devices
  const devices = await prisma.deviceEvent.findMany({
    orderBy: { lastSeen: "desc" },
    select: {
      id: true,
      userId: true,
      deviceId: true,
      deviceType: true,
      ip: true,
      lastSeen: true,
    },
  });

  // Transform for UI
  const formatted = devices.map((d) => ({
    userId: d.userId ?? "Unknown",
    device: d.deviceType ?? d.deviceId ?? "Unknown",
    ip: d.ip ?? "Unknown",
    lastSeen: d.lastSeen,
  }));

  return ok({ devices: formatted });
}
