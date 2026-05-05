import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50,
  duration: "5m",
  thresholds: {
    http_req_duration: ["p(95)<800"], // 95% under 800ms
    http_req_failed: ["rate<0.01"],   // <1% failures
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

function randomPhone() {
  const n = Math.floor(10000000 + Math.random() * 89999999);
  return `23480${n}`;
}

export default function () {
  // 1) List products
  const productsRes = http.get(`${BASE_URL}/api/products`);
  check(productsRes, {
    "products: status 200": (r) => r.status === 200,
  });

  const products = productsRes.json();
  if (!products || !products.length) {
    sleep(1);
    return;
  }

  const product = products[Math.floor(Math.random() * products.length)];
  const variant = product.variants[0];
  const phone = randomPhone();

  // 2) Create reservation
  const reservationRes = http.post(
    `${BASE_URL}/api/reservations`,
    JSON.stringify({
      variantId: variant.id,
      quantity: 1,
      phone,
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(reservationRes, {
    "reservation: status 201": (r) => r.status === 201,
  });

  const reservation = reservationRes.json();
  if (!reservation || !reservation.id) {
    sleep(1);
    return;
  }

  // 3) Create order from WhatsApp flow
  const orderRes = http.post(
    `${BASE_URL}/api/orders`,
    JSON.stringify({
      phone,
      reservations: [reservation.id],
      sourceChannel: "whatsapp",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(orderRes, {
    "order: status 201": (r) => r.status === 201,
  });

  const order = orderRes.json();
  if (!order || !order.id) {
    sleep(1);
    return;
  }

  // 4) Create payment (bank transfer pending)
  const paymentRes = http.post(
    `${BASE_URL}/api/payments`,
    JSON.stringify({
      orderId: order.id,
      method: "bank_transfer",
      amount: order.totalAmount,
      currency: "NGN",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(paymentRes, {
    "payment: status 201": (r) => r.status === 201,
  });

  sleep(1);
}
