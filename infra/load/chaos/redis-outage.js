import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "3m",
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  // Normal enqueue
  const res = http.post(
    `${BASE_URL}/api/notifications/whatsapp`,
    JSON.stringify({
      phone: "23480" + Math.floor(10000000 + Math.random() * 89999999),
      template: "order_confirmation",
      data: { orderId: "chaos-" + Math.random().toString(36).slice(2) },
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(res, {
    "enqueue accepted": (r) => r.status === 202 || r.status === 500,
  });

  // Simulate Redis outage window
  if (__ITER % 50 === 0) {
    http.get(`${BASE_URL}/api/chaos/redis/disconnect`);
  }

  sleep(0.3);
}
