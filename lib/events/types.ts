/* -------------------------------------------------- */
/* JSON-safe metadata                                  */
/* -------------------------------------------------- */

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type EventMetadata = Record<string, JsonValue>;

/* -------------------------------------------------- */
/* Shared types                                        */
/* -------------------------------------------------- */

export type EventSeverity = "low" | "medium" | "high";

export type EventSource =
  | "api"
  | "auth"
  | "system"
  | "worker"
  | "middleware"
  | "cron";

export type EventCategory =
  | "auth"
  | "fraud"
  | "risk"
  | "security"
  | "performance"
  | "admin";

/* -------------------------------------------------- */
/* Input envelope for emitters                         */
/* -------------------------------------------------- */

export type EventInput<K extends string, P> = {
  kind: K;
  source: EventSource;
  category: EventCategory;
  severity?: EventSeverity;
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  correlationId?: string | null;
  encryptedMetadata?: boolean;
  metadata?: EventMetadata;
} & P;

/* -------------------------------------------------- */
/* Security events                                     */
/* -------------------------------------------------- */

export const SECURITY_EVENT_TYPES = [
  "SESSION_MISSING",
  "SESSION_MALFORMED",
  "SESSION_SIGNATURE_INVALID",
  "SESSION_DECODE_FAILED",
  "SESSION_EXPIRED",
  "SESSION_HIGH_RISK",
  "PERMISSION_CHECK",
  "PERMISSION_DENIED",
  "RATE_LIMIT_CHECK",
  "AUTH_RATE_LIMIT",
  "API_UNAUTHORIZED",
  "API_FORBIDDEN",
  "RISK_EVALUATION",
  "HIGH_RISK_BLOCK",
  "RISK_CHALLENGE_REQUIRED",
  "UNAUTHORIZED_ACCESS_WARNING",
  "UNAUTHORIZED_ACCESS_ATTEMPT",
  "UNAUTHORIZED_ACCESS_CRITICAL",
  "FRAUD_SCORE",
  "SUSPICIOUS_IP",
  "SYSTEM_ANOMALY",
  "PERFORMANCE_METRIC",
] as const;

export type SecurityEventType = (typeof SECURITY_EVENT_TYPES)[number];

export type SecurityEventInput = EventInput<
  "security",
  {
    type: SecurityEventType;
    message: string;
  }
>;

/* -------------------------------------------------- */
/* Audit events                                        */
/* -------------------------------------------------- */

export const AUDIT_ACTIONS = [
  "ORDER_CREATED",
  "ORDER_UPDATED",
  "ORDER_CANCELLED",
  "PRODUCT_CREATED",
  "PRODUCT_UPDATED",
  "ADMIN_LOGIN",
  "RISK_RULE_TRIGGERED",
  "RISK_SCORE_COMPUTED",
  "USER_PERMISSION_CHANGED",
  "USER_ROLE_CHANGED",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AuditEventInput = EventInput<
  "audit",
  {
    action: AuditAction;
    actorType: "USER" | "ADMIN" | "SYSTEM" | "JOB";
    resource?: string | null;
    resourceId?: string | null;
  }
>;

/* -------------------------------------------------- */
/* Fraud events                                        */
/* -------------------------------------------------- */

export const FRAUD_SIGNALS = [
  "WEBHOOK_SIGNATURE_MISMATCH",
  "WEBHOOK_UNKNOWN_ORDER",
  "WEBHOOK_DUPLICATE_EXCESSIVE",
  "WEBHOOK_PROVIDER_MISMATCH",
  "WEBHOOK_PROCESSING_ERROR",
  "PAYMENT_VERIFICATION_FAILED",
  "PROVIDER_ERROR",
  "PROVIDER_REPORTED_FAILURE",
  "AMOUNT_MISMATCH",
  "SUSPICIOUS_IP",
  "HIGH_VALUE_ORDER",
  "FRAUD_IP_BLACKLISTED",
  "FRAUD_EMAIL_MISMATCH",
  "FRAUD_AMOUNT_MISMATCH",
  "FRAUD_PROVIDER_MISMATCH",
  "FRAUD_HIGH_RISK_SCORE",
  "FRAUD_VELOCITY",
  "FRAUD_DEVICE_MISMATCH",
  "FRAUD_SCORE_COMPUTED",
] as const;

export type FraudSignal = (typeof FRAUD_SIGNALS)[number];

export type FraudEventInput = EventInput<
  "fraud",
  {
    signal: FraudSignal;
    orderId?: string | null;
  }
>;

/* -------------------------------------------------- */
/* Alert events                                        */
/* -------------------------------------------------- */

export const ALERT_EVENT_TYPES = [
  "ALERT_RISK_SCORE_HIGH",
  "ALERT_FRAUD_SIGNAL",
  "FRAUD_BLOCK",
  "HIGH_RISK_BLOCK",
  "RISK_CHALLENGE_REQUIRED",
  "ALERT_SYSTEM_FAILURE",
  "PERMISSION_DENIED_THRESHOLD_MEDIUM",
  "PERMISSION_DENIED_THRESHOLD_HIGH",
  "RATE_LIMIT_ABUSE",
  "UNAUTHORIZED_ACCESS_WARNING",
  "PERFORMANCE_SLOW_OPERATION",
  "UNAUTHORIZED_ACCESS_CRITICAL",
] as const;

export type AlertEventType = (typeof ALERT_EVENT_TYPES)[number];

export type AlertEventInput = EventInput<
  "alert",
  {
    event: AlertEventType;
  }
>;

/* -------------------------------------------------- */
/* Discriminated union for pipeline                    */
/* -------------------------------------------------- */

export type AnyEventInput =
  | SecurityEventInput
  | AuditEventInput
  | FraudEventInput
  | AlertEventInput;
