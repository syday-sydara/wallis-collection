import {
  PrismaClient,
  ReservationStatus,
  OrderStatus,
  PaymentStatus,
  ActorType,
  WhatsAppMessageStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}

async function main() {
  console.log("🌱 Seeding full test dataset...");

  // ------------------------------------------------------
  // USERS
  // ------------------------------------------------------
  const users = await prisma.$transaction(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.user.create({
        data: {
          email: `user${i}@example.com`,
          name: `User ${i}`,
        },
      })
    )
  );

  // ------------------------------------------------------
  // CUSTOMERS
  // ------------------------------------------------------
  const customers = await prisma.$transaction(
    Array.from({ length: 100 }).map((_, i) =>
      prisma.customer.create({
        data: {
          name: `Customer ${i}`,
          email: `customer${i}@example.com`,
          phone: `23480${rand(10000000, 99999999)}`,
        },
      })
    )
  );

  // ------------------------------------------------------
  // PRODUCTS + VARIANTS
  // ------------------------------------------------------
  const products = await prisma.$transaction(
    Array.from({ length: 100 }).map((_, i) =>
      prisma.product.create({
        data: {
          name: `Product ${i}`,
          slug: `product-${i}`,
          description: `Description for product ${i}`,
          variants: {
            create: Array.from({ length: 3 }).map((__, j) => ({
              sku: `SKU-${i}-${j}`,
              name: `Variant ${j}`,
              price: rand(50000, 200000),
              currency: "NGN",
              stockQty: rand(10, 100),
            })),
          },
        },
        include: { variants: true },
      })
    )
  );

  const allVariants = products.flatMap((p) => p.variants);

  // ------------------------------------------------------
  // WHATSAPP SESSIONS + MESSAGES
  // ------------------------------------------------------
  const sessions = await prisma.$transaction(
    customers.map((c) =>
      prisma.whatsAppSession.create({
        data: {
          phone: c.phone!,
          phoneNormalized: c.phone!,
          customerId: c.id,
          lastMessageAt: new Date(),
        },
      })
    )
  );

  await prisma.$transaction(
    Array.from({ length: 300 }).map(() => {
      const session = pick(sessions);
      return prisma.whatsAppMessage.create({
        data: {
          sessionId: session.id,
          direction: pick(["INBOUND", "OUTBOUND"]),
          body: "Test message",
          status: pick([
            WhatsAppMessageStatus.QUEUED,
            WhatsAppMessageStatus.SENT,
            WhatsAppMessageStatus.DELIVERED,
          ]),
        },
      });
    })
  );

  // ------------------------------------------------------
  // RESERVATIONS
  // ------------------------------------------------------
  const reservations = await prisma.$transaction(
    Array.from({ length: 300 }).map(() => {
      const variant = pick(allVariants);
      return prisma.stockReservation.create({
        data: {
          variantId: variant.id,
          quantity: rand(1, 3),
          status: ReservationStatus.ACTIVE,
          expiresAt: new Date(Date.now() + rand(5, 30) * 60 * 1000),
        },
      });
    })
  );

  // ------------------------------------------------------
  // ORDERS + ITEMS + STATUS HISTORY
  // ------------------------------------------------------
  const orders = await prisma.$transaction(
    Array.from({ length: 100 }).map((_, i) => {
      const customer = pick(customers);
      const session = pick(sessions);

      return prisma.order.create({
        data: {
          customerId: customer.id,
          status: pick([
            OrderStatus.PENDING,
            OrderStatus.AWAITING_PAYMENT,
            OrderStatus.PAID,
          ]),
          currency: "NGN",
          phone: customer.phone!,
          phoneNormalized: customer.phone!,
          whatsAppSessionId: session.id,
          totalAmount: 0,

          statusHistory: {
            create: {
              status: OrderStatus.PENDING,
              reason: "Order created in test dataset",
            },
          },
        },
      });
    })
  );

  // ------------------------------------------------------
  // ORDER ITEMS + TOTAL AMOUNT FIX
  // ------------------------------------------------------
  for (const order of orders) {
    const variant = pick(allVariants);
    const qty = rand(1, 3);

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        variantId: variant.id,
        quantity: qty,
        unitPrice: variant.price,
        currency: "NGN",
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        totalAmount: qty * variant.price,
      },
    });
  }

  // ------------------------------------------------------
  // PAYMENTS
  // ------------------------------------------------------
  await prisma.$transaction(
    orders.map((order) =>
      prisma.payment.create({
        data: {
          orderId: order.id,
          method: "bank_transfer",
          status: pick([
            PaymentStatus.PENDING,
            PaymentStatus.TRANSFER_SENT,
            PaymentStatus.VERIFIED,
          ]),
          amount: order.totalAmount,
          currency: "NGN",
        },
      })
    )
  );

  // ------------------------------------------------------
  // AUDIT LOGS
  // ------------------------------------------------------
  await prisma.$transaction(
    orders.map((order) =>
      prisma.auditLog.create({
        data: {
          userId: pick(users).id,
          actorType: ActorType.USER,
          action: "ORDER_CREATED",
          entityType: "Order",
          entityId: order.id,
          metadata: { seed: true },
          ipAddress: "127.0.0.1",
          userAgent: "seed-script",
        },
      })
    )
  );

  console.log("🌱 Full test dataset seeded successfully!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
