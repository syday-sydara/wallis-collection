import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 25,
  duration: "4m",
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  // Inject latency every 40 iterations
  if (__ITER % 40 === 0) {
    http.get(`${BASE_URL}/api/chaos/redis/slow?ms=800`);
  }

  const res = http.post(
    `${BASE_URL}/api/notifications/whatsapp`,
    JSON.stringify({
      phone: "23480" + Math.floor(10000000 + Math.random() * 89999999),
      template: "payment_reminder",
      data: { amount: 15000 },
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(res, {
    "enqueue accepted": (r) => r.status === 202 || r.status === 500,
  });

  sleep(0.3);
}
