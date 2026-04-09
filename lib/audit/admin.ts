// lib/audit/admin.ts
import { getAlertRoute } from "./policy";

export function describeAlertRoute(action: string) {
  const route = getAlertRoute(action);
  if (!route) return null;

  return {
    action: route.action,
    channels: route.channels,
    severity: route.severity,
  };
}
