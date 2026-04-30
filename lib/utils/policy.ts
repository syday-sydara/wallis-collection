// lib/audit/policy.ts
export type AlertChannel = "EMAIL" | "SLACK" | "LOG_ONLY";

export interface AlertRoute {
  action: string;
  channels: AlertChannel[];
  severity: "low" | "medium" | "high";
}

const routes: AlertRoute[] = [
  {
    action: "ALERT_RISK_SCORE_HIGH",
    channels: ["EMAIL", "SLACK"],
    severity: "high",
  },
  {
    action: "ALERT_FRAUD_SIGNAL",
    channels: ["EMAIL"],
    severity: "high",
  },
  {
    action: "ALERT_SYSTEM_FAILURE",
    channels: ["SLACK"],
    severity: "medium",
  },
];

export function getAlertRoute(action: string): AlertRoute | null {
  return routes.find((r) => r.action === action) ?? null;
}
