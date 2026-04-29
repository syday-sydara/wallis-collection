// lib/security/events/securityEvent.ts

export interface SecurityEvent {
  type: string;
  severity: string;
  message: string;
  metadata?: Record<string, any>;
}
