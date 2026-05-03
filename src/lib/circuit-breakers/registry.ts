// lib/circuit-breakers.ts
import { CircuitBreaker } from "./circuit-breaker";

const base = {
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 30_000,

  onStateChange: (name, from, to) => {
    console.warn(`[CB:${name}] ${from} → ${to}`);
  },

  onFailure: (name, err) => {
    console.error(`[CB:${name}] failure:`, err.message);
  },

  onSuccess: (name) => {
    // console.log(`[CB:${name}] success`);
  },
};

// Per‑service tuning
export const WhatsAppBreaker = new CircuitBreaker(
  { ...base, failureThreshold: 3, timeoutMs: 15_000 },
  "whatsapp"
);

export const SmsBreaker = new CircuitBreaker(
  { ...base, failureThreshold: 4, timeoutMs: 20_000 },
  "sms"
);

export const EmailBreaker = new CircuitBreaker(
  { ...base, failureThreshold: 5, timeoutMs: 30_000 },
  "email"
);

export const PaymentBreaker = new CircuitBreaker(
  { ...base, failureThreshold: 2, timeoutMs: 60_000 },
  "payment"
);

// Registry for introspection / admin endpoints
export const CircuitBreakers = {
  whatsapp: WhatsAppBreaker,
  sms: SmsBreaker,
  email: EmailBreaker,
  payment: PaymentBreaker,
};
