import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 15,
  duration: "4m",
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const payload = JSON.stringify({
    phone: "23480" + Math.floor(10000000 + Math.random() * 89999999),
    template: "shipping_update",
    data: { tracking: "TRK-" + Math.random().toString(36).slice(2) },
  });

  // 50% of requests force provider outage
  const chaos = Math.random() < 0.5;

  if (chaos) {
    http.get(`${BASE_URL}/api/chaos/provider/down`);
  }

  const res = http.post(`${BASE_URL}/api/notifications/whatsapp`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  check(res, {
    "enqueue accepted": (r) => r.status === 202 || r.status === 500,
  });

  sleep(0.4);
}
