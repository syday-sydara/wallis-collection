// lib/security/utils/safeJson.ts

export function safeJson(input: any) {
  try {
    return JSON.stringify(input);
  } catch {
    return "{}";
  }
}
