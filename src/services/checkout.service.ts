import { normalizePhone } from "../utils/phone";
import { prisma } from "../lib/prisma";

export async function createOrder(input) {
  // 1. Normalize + validate
  const phone = normalizePhone(input.phoneNumber);
  if (!phone) throw new Error("Invalid phone number");

  // 2. Find or create customer
  const customer = await prisma.customer.upsert({
    where: { phone },
    update: {
      name: input.name ?? undefined,
      email: input.email ?? undefined,
    },
    create: {
      phone,
      name: input.name ?? null,
      email: input.email ?? null,
    },
  });

  // 3. Find the most recent WhatsApp session for this customer
  const session = await prisma.whatsAppSession.findFirst({
    where: { customerId: customer.id },
    orderBy: { lastInboundAt: "desc" },
  });

  // 4. Create order linked to customer + optional WhatsApp session
  return prisma.order.create({
    data: {
      customerId: customer.id,
      phone,
      phoneNormalized: phone,
      currency: input.currency,
      totalAmount: input.totalAmount ?? 0,
      notes: input.notes ?? null,
      externalRef: input.externalRef ?? null,

      // Link to WhatsApp session if one exists
      whatsAppSessionId: session?.id ?? null,

      // Spread any additional fields
      ...input,
    },
  });
}
