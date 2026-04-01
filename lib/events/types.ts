// lib/events/types.ts
export type BaseEvent = {
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
};

export type SecurityEventInput = BaseEvent & {
  kind: "security";
  type: string;        // e.g. "PERMISSION_DENIED"
  severity?: "low" | "medium" | "high";
  message: string;
};

export type AuditEventInput = BaseEvent & {
  kind: "audit";
  action: string;      // e.g. "ORDER_CREATED"
  actorType: "USER" | "ADMIN" | "SYSTEM" | "JOB";
  resource?: string;
  resourceId?: string;
};

export type FraudEventInput = BaseEvent & {
  kind: "fraud";
  signal: string;      // e.g. "FRAUD_IP_BLACKLISTED"
  orderId?: string;
};

export type AlertEventInput = BaseEvent & {
  kind: "alert";
  event: string;       // e.g. "ALERT_RISK_SCORE_HIGH"
};