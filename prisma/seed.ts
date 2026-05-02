import {
  PrismaClient,
  ReservationStatus,
  OrderStatus,
  PaymentStatus,
  ActorType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ------------------------------------------------------
  // USER
  // ------------------------------------------------------
  const user = await prisma.user.create({
    data: {
      email: "customer@example.com",
      name: "Test Customer",
    },
  });

  // ------------------------------------------------------
  // PRODUCT + VARIANTS
  // ------------------------------------------------------
  const product = await prisma.product.create({
    data: {
      name: "Premium T‑Shirt",
      slug: "premium-tshirt",
      description: "High‑quality cotton T‑shirt",
      variants: {
        create: [
          {
            sku: "TSHIRT-BLACK-M",
            name: "Black / Medium",
            price: 150000, // ₦1,500.00
            currency: "NGN",
            stockQty: 50,
          },
          {
            sku: "TSHIRT-BLACK-L",
            name: "Black / Large",
            price: 150000,
            currency: "NGN",
            stockQty: 30,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const variantM = product.variants[0];

  // ------------------------------------------------------
  // WHATSAPP SESSION + MESSAGE
  // ------------------------------------------------------
  const session = await prisma.whatsAppSession.create({
    data: {
      phone: "+2348012345678",
      phoneNormalized: "2348012345678",
      lastMessageAt: new Date(),
    },
  });

  await prisma.whatsAppMessage.create({
    data: {
      sessionId: session.id,
      direction: "INBOUND",
      body: "Hi, is the black T‑shirt available?",
    },
  });

  // ------------------------------------------------------
  // RESERVATION (ACTIVE)
  // ------------------------------------------------------
  const reservation = await prisma.stockReservation.create({
    data: {
      variantId: variantM.id,
      quantity: 2,
      status: ReservationStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
  });

  // ------------------------------------------------------
  // ORDER (RESERVATION-DRIVEN + WHATSAPP LINKED)
  // ------------------------------------------------------
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: OrderStatus.PENDING,
      currency: "NGN",
      phone: "+2348012345678",
      phoneNormalized: "2348012345678",

      // Link WhatsApp session
      whatsAppSessionId: session.id,

      // Attach reservation
      reservations: {
        connect: [{ id: reservation.id }],
      },

      statusHistory: {
        create: {
          status: OrderStatus.PENDING,
          reason: "Order created from WhatsApp session",
        },
      },
    },
  });

  // Attach orderId to reservation
  await prisma.stockReservation.update({
    where: { id: reservation.id },
    data: { orderId: order.id },
  });

  // ------------------------------------------------------
  // PAYMENT
  // ------------------------------------------------------
  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "paystack",
      status: PaymentStatus.INITIATED,
      amount: 2 * variantM.price,
      currency: "NGN",
      metadata: {
        channel: "whatsapp",
      },
    },
  });

  // ------------------------------------------------------
  // AUDIT LOG
  // ------------------------------------------------------
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      actorType: ActorType.USER,
      action: "ORDER_CREATED",
      entityType: "Order",
      entityId: order.id,
      metadata: {
        source: "seed-script",
      },
      ipAddress: "127.0.0.1",
      userAgent: "seed-script",
    },
  });

  console.log("🌱 Seed complete!");
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
