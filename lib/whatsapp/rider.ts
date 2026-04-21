import { sendWhatsAppMessage } from "./send";
import { signRiderLink } from "../rider/sign";

export async function sendRiderLinks(fulfillment: any) {
  const delivered = signRiderLink(fulfillment.id, "DELIVERED");
  const failed = signRiderLink(fulfillment.id, "FAILED");

  const message = `
Rider Update Link for Order #${fulfillment.orderId}

Tap one option:

✔️ Delivered:
${delivered}

❌ Delivery Failed:
${failed}
  `;

  return sendWhatsAppMessage(fulfillment.order.phone, message);
}
