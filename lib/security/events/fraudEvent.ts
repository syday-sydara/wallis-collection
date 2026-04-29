// lib/security/events/fraudEvent.ts

export interface FraudEvent {
  type: string;
  score: number;
  metadata?: Record<string, any>;
}
