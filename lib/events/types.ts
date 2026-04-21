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
  | "admin"
  | "business"
  | "operational";

/* -------------------------------------------------- */
/* Base Event Envelope                                 */
/* -------------------------------------------------- */

export type BaseEvent = {
  id?: string;
  timestamp?: string; // ISO string
  requestId?: string | null;
  source?: EventSource | null;
  category?: EventCategory | null;
  severity: EventSeverity;
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  correlationId?: string | null;
  encryptedMetadata?: boolean;
  metadata?: EventMetadata;
};

/* -------------------------------------------------- */
/* Generic Event Input                                 */
/* -------------------------------------------------- */

export type EventInput<K extends string, P> = BaseEvent & {
  kind: K;
} & P;

/* -------------------------------------------------- */
/* Security Events                                     */
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
/* Audit Events                                        */
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
    resource?: string;
    resourceId?: string;
  }
>;

/* -------------------------------------------------- */
/* Fraud Events                                        */
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
    orderId?: string;
  }
>;

/* -------------------------------------------------- */
/* Alert Events                                        */
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
/* Operational Events                                  */
/* -------------------------------------------------- */

export type OperationalEventInput = EventInput<
  "operational",
  {
    operation: string; // e.g. "reconciliation.run", "queue.process"
    durationMs?: number;
    success: boolean;
  }
>;

/* -------------------------------------------------- */
/* Business Events                                     */
/* -------------------------------------------------- */

export type BusinessEventInput = EventInput<
  "business",
  {
    event: "ORDER_STATUS_CHANGED" | "PAYMENT_STATUS_CHANGED";
    orderId?: string;
    paymentId?: string;
    from?: string;
    to?: string;
  }
>;

/* -------------------------------------------------- */
/* Discriminated union for pipeline                    */
/* -------------------------------------------------- */

export type AnyEventInput =
  | SecurityEventInput
  | AuditEventInput
  | FraudEventInput
  | AlertEventInput
  | OperationalEventInput
  | BusinessEventInput;
