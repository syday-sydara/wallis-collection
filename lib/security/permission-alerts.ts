// lib/security/permission-alerts.ts
import { sendWhatsAppAlert } from "@/lib/alerts/whatsapp";
import { redis } from "@/lib/redis";

const VERSION = 1;

export async function maybeSendUnauthorizedAlert(ip: string, count: number) {
  // Normalize IP (strip proxy chains)
  const normalizedIp = ip.split(",")[0].trim();

  // Optional: rate-limit alerts globally per IP
  let throttled = false;
  try {
    const rlKey = `unauth-alert:${normalizedIp}`;
    const hits = await redis.incr(rlKey);
    await redis.expire(rlKey, 60); // 1 minute window
    throttled = hits > 3; // allow 3 alerts/min per IP
  } catch {
    // Redis unavailable — continue without rate limiting
  }

  if (throttled) return;

  // Threshold alerts
  if (count === 5) {
    sendWhatsAppAlert({
      to: process.env.SECURITY_PHONE!,
      template: "unauthorized_access_warning",
      severity: "medium",
      variables: [normalizedIp, "5", VERSION.toString()],
    }).catch((err) => {
      console.error("Failed to send unauthorized warning:", err);
    });
  }

  if (count === 10) {
    sendWhatsAppAlert({
      to: process.env.SECURITY_PHONE!,
      template: "unauthorized_access_critical",
      severity: "high",
      variables: [normalizedIp, "10", VERSION.toString()],
    }).catch((err) => {
      console.error("Failed to send unauthorized critical alert:", err);
    });
  }
}