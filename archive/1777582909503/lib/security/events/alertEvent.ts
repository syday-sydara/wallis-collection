// lib/security/events/alertEvent.ts

export interface AlertEvent {
  type: string;
  metadata?: Record<string, any>;
}
