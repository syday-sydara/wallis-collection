import { z } from "zod";

const traceId = (() => {
  if (typeof window === "undefined") return "server-" + crypto.randomUUID();
  return "client-" + crypto.randomUUID();
})();

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-trace-id": traceId,
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Invalid JSON from ${url}`);
  }

  if (!res.ok) {
    throw new Error(json?.message || `Request failed: ${res.status}`);
  }

  return json as T;
}

export const http = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: any) =>
    request<T>(url, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(url: string, body: any) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
