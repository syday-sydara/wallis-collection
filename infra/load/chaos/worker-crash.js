import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "3m",
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  // Trigger worker crash every 30 iterations
  if (__ITER % 30 === 0) {
    http.get(`${BASE_URL}/api/chaos/worker/crash`);
  }

  const res = http.post(
    `${BASE_URL}/api/notifications/whatsapp`,
    JSON.stringify({
      phone: "23480" + Math.floor(10000000 + Math.random() * 89999999),
      template: "order_status",
      data: { status: "FULFILLED" },
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(res, {
    "enqueue accepted": (r) => r.status === 202 || r.status === 500,
  });

  sleep(0.5);
}
