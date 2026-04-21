// lib/whatsapp/onboarding.ts
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "./send";
import { sendWhatsAppList } from "./list";

export async function handleOnboardingMessage(from: string, text?: string) {
  // Step 1: First contact → ask for phone number
  if (!text || text.toLowerCase().includes("hi") || text.toLowerCase().includes("hello")) {
    await sendWhatsAppMessage(
      from,
      "Welcome! Please reply with the phone number you used when placing your order."
    );
    return;
  }

  // Step 2: Treat message as phone number
  const phone = text.trim();

  const orders = await prisma.order.findMany({
    where: { phone },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (!orders.length) {
    await sendWhatsAppMessage(
      from,
      "I couldn't find any orders with that phone number. Please check and try again."
    );
    return;
  }

  if (orders.length === 1) {
    const order = orders[0];
    await sendWhatsAppMessage(
      from,
      `I found your order #${order.id.slice(0, 8)}.\nYou can track it here:\n${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}`
    );
    return;
  }

  // Step 3: Multiple orders → show list
  await sendWhatsAppList({
    to: from,
    body: "I found multiple orders for this phone number. Please select one:",
    buttonText: "Select order",
    sections: [
      {
        title: "Your recent orders",
        rows: orders.map((order) => ({
          id: `order_${order.id}`,
          title: `Order #${order.id.slice(0, 8)}`,
          description: `Total: ₦${order.total.toLocaleString()}`,
        })),
      },
    ],
  });
}
