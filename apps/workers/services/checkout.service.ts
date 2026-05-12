import { normalizePhone } from "@/utils/phone";
import { prisma } from "@/lib/prisma";

export async function createOrder(input: any) {
  // -----------------------------------------------------
  // 1. Normalize + validate phone
  // -----------------------------------------------------
  const phone = normalizePhone(input.phoneNumber);
  if (!phone) throw new Error("Invalid phone number");

  // -----------------------------------------------------
  // 2. Upsert customer (idempotent)
  // -----------------------------------------------------
  const customer = await prisma.customer.upsert({
    where: { phoneNormalized: phone },
    update: {
      name: input.name ?? undefined,
      email: input.email ?? undefined,
    },
    create: {
      phone,
      phoneNormalized: phone,
      name: input.name ?? null,
      email: input.email ?? null,
    },
  });

  // -----------------------------------------------------
  // 3. Get most recent WhatsApp session
  // -----------------------------------------------------
  const session = await prisma.whatsAppSession.findFirst({
    where: { customerId: customer.id },
    orderBy: { lastInboundAt: "desc" },
  });

  // -----------------------------------------------------
  // 4. Create order (safe spread, no overwrite)
  // -----------------------------------------------------
  return prisma.order.create({
    data: {
      customerId: customer.id,
      phone,
      phoneNormalized: phone,

      currency: input.currency,
      totalAmount: input.totalAmount ?? 0,
      notes: input.notes ?? null,
      externalRef: input.externalRef ?? null,

      whatsAppSessionId: session?.id ?? null,

      // Only allow safe fields from input
      ...safeOrderFields(input),
    },
  });
}

/**
 * Prevents user input from overwriting protected fields.
 */
function safeOrderFields(input: any) {
  const allowed = [
    "subtotal",
    "deliveryFee",
    "discount",
    "items",
    "metadata",
    "source",
  ];

  const out: any = {};
  for (const key of allowed) {
    if (key in input) out[key] = input[key];
  }
  return out;
}
