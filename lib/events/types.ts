// lib/events/types.ts

export type BaseEvent = {
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
};

// --- Security Events --------------------------------------------------------

export type SecurityEventType =
  | "PERMISSION_DENIED"
  | "AUTH_RATE_LIMIT"
  | "SUSPICIOUS_IP"
  | "WEBHOOK_SIGNATURE_MISMATCH"
  | "SYSTEM_ANOMALY";

export type SecurityEventInput = BaseEvent & {
  kind: "security";
  type: SecurityEventType;
  severity?: "low" | "medium" | "high";
  message: string;
};

// --- Audit Events -----------------------------------------------------------

export type AuditAction =
  | "ORDER_CREATED"
  | "ORDER_UPDATED"
  | "ORDER_CANCELLED"
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "ADMIN_LOGIN"
  | "RISK_RULE_TRIGGERED"
  | "RISK_SCORE_COMPUTED";

export type AuditEventInput = BaseEvent & {
  kind: "audit";
  action: AuditAction;
  actorType: "USER" | "ADMIN" | "SYSTEM" | "JOB";
  resource?: string;
  resourceId?: string;
};

// --- Fraud Events -----------------------------------------------------------

export type FraudSignal =
  | "FRAUD_IP_BLACKLISTED"
  | "FRAUD_EMAIL_MISMATCH"
  | "FRAUD_AMOUNT_MISMATCH"
  | "FRAUD_PROVIDER_MISMATCH"
  | "FRAUD_HIGH_RISK_SCORE";

export type FraudEventInput = BaseEvent & {
  kind: "fraud";
  signal: FraudSignal;
  orderId?: string;
  metadata?: {
    email?: string;
    score?: number;
    triggeredRules?: string[];
    [key: string]: any;
  };
};

// --- Alert Events -----------------------------------------------------------

export type AlertEventType =
  | "ALERT_RISK_SCORE_HIGH"
  | "ALERT_FRAUD_SIGNAL"
  | "ALERT_SYSTEM_FAILURE";

export type AlertEventInput = BaseEvent & {
  kind: "alert";
  event: AlertEventType;
  metadata?: Record<string, any>;
};