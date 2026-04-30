// lib/whatsapp/transport.ts

import {
  WHATSAPP_BASE_URL,
  WHATSAPP_TIMEOUT_MS,
  WHATSAPP_MAX_ATTEMPTS,
  WHATSAPP_CIRCUIT_FAILURE_THRESHOLD,
  WHATSAPP_CIRCUIT_OPEN_MS,
} from "./config";

export type WhatsAppResult =
  | { ok: true; attempt: number }
  | {
      ok: false;
      error:
        | "missing_credentials"
        | "rate_limited"
        | "api_error"
        | "network_error"
        | "circuit_open"
        | "unknown";
      status?: number;
      raw?: any;
      attempt?: number;
    };

function getCredentials() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return null;
  return { token, phoneId };
}

// ---------------------------------------------------------------------------
// Circuit Breaker (in-memory, per process)
// ---------------------------------------------------------------------------

let failures = 0;
let circuitOpenUntil = 0;

function isCircuitOpen() {
  return Date.now() < circuitOpenUntil;
}

function recordFailure() {
  failures++;
  if (failures >= WHATSAPP_CIRCUIT_FAILURE_THRESHOLD) {
    circuitOpenUntil = Date.now() + WHATSAPP_CIRCUIT_OPEN_MS;
  }
}

function recordSuccess() {
  failures = 0;
  circuitOpenUntil = 0;
}

// ---------------------------------------------------------------------------
// Timeout wrapper
// ---------------------------------------------------------------------------

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    const result = await promise;
    clearTimeout(timeout);
    return result;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Transport Layer
// ---------------------------------------------------------------------------

export class WhatsAppTransport {
  static async call(to: string, body: any): Promise<WhatsAppResult> {
    const creds = getCredentials();
    if (!creds) return { ok: false, error: "missing_credentials" };

    if (isCircuitOpen()) {
      return { ok: false, error: "circuit_open" };
    }

    const url = `${WHATSAPP_BASE_URL}/${creds.phoneId}/messages`;

    for (let attempt = 1; attempt <= WHATSAPP_MAX_ATTEMPTS; attempt++) {
      try {
        const res = await withTimeout(
          fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${creds.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...body, to }),
          }),
          WHATSAPP_TIMEOUT_MS,
        );

        // ---------------------------
        // SUCCESS
        // ---------------------------
        if (res.ok) {
          recordSuccess();
          return { ok: true, attempt };
        }

        // ---------------------------
        // FAILURE (non-2xx)
        // ---------------------------
        const status = res.status;
        const raw = await res.json().catch(() => null);

        // Rate limit
        if (status === 429) {
          recordFailure();
          return { ok: false, error: "rate_limited", status, raw, attempt };
        }

        // Retry 5xx
        if (status >= 500 && attempt < WHATSAPP_MAX_ATTEMPTS) {
          recordFailure();
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }

        // Final 5xx or 4xx
        if (status >= 500) recordFailure();
        return { ok: false, error: "api_error", status, raw, attempt };
      } catch {
        // ---------------------------
        // NETWORK ERROR
        // ---------------------------
        if (attempt === WHATSAPP_MAX_ATTEMPTS) {
          recordFailure();
          return { ok: false, error: "network_error", attempt };
        }

        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }

    // Should never reach here
    recordFailure();
    return { ok: false, error: "unknown" };
  }
}
