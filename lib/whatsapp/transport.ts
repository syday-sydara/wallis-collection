// lib/whatsapp/transport.ts

const BASE_URL = "https://graph.facebook.com/v18.0";
const TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 2;

export type WhatsAppResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
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

export class WhatsAppTransport {
  static async call(to: string, body: any): Promise<WhatsAppResult> {
    const creds = getCredentials();
    if (!creds) return { ok: false, error: "missing_credentials" };

    const url = `${BASE_URL}/${creds.phoneId}/messages`;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
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
          TIMEOUT_MS
        );

        if (res.ok) return { ok: true };

        const status = res.status;
        const raw = await res.json().catch(() => null);

        if (status === 429) {
          return { ok: false, error: "rate_limited", status, raw, attempt };
        }

        if (status >= 500 && attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }

        return { ok: false, error: "api_error", status, raw, attempt };
      } catch {
        if (attempt === MAX_ATTEMPTS) {
          return { ok: false, error: "network_error", attempt };
        }

        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }

    return { ok: false, error: "unknown" };
  }
}
