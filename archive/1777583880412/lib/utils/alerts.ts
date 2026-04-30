// lib/audit/alerts.ts
import { getAlertRoute } from "./policy";
import { emitAlertEvent } from "@/lib/events/emitter";

export async function processAlert(params: {
  action: string;
  metadata?: Record<string, any>;
}) {
  const { action, metadata = {} } = params;

  const route = getAlertRoute(action);

  // Always persist alert event
  await emitAlertEvent({
    event: action as any,
    metadata,
  });

  if (!route) {
    console.warn("[Alert] No route configured for action:", action);
    return;
  }

  // Here you’d integrate with email/Slack/etc.
  // For now, just log based on severity/channels.
  console.log("[Alert] Routed alert:", {
    action,
    channels: route.channels,
    severity: route.severity,
    metadata,
  });
}
