import {
  PrismaClient,
  OrderStatus,
  PaymentStatus,
  PaymentProvider,
  ShipmentStatus,
  ReservationStatus
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // -------------------------------------
  // USERS
  // -------------------------------------
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      phone: "08012345678",
      email: "test@example.com",
    },
  });

  // -------------------------------------
  // PRODUCTS + VARIANTS
  // -------------------------------------
  const product = await prisma.product.create({
    data: {
      name: "Ankara Fabric",
      slug: "ankara-fabric",
      description: "High quality African print fabric",
      fabricType: "WAX",
      color: "Blue",
      pattern: "Floral",
      images: {
        create: [
          { url: "https://example.com/image1.jpg", alt: "Fabric Image 1" },
        ],
      },
      variants: {
        create: [
          {
            name: "2 yards",
            sku: "ANK-2Y",
            price: 5000,
            stockQty: 20,
          },
          {
            name: "4 yards",
            sku: "ANK-4Y",
            price: 9000,
            stockQty: 15,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const variant = product.variants[0];

  // -------------------------------------
  // ORDER
  // -------------------------------------
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      phoneNumber: "08012345678",
      addressLine1: "123 Test Street",
      city: "Lagos",
      state: "Lagos",
      subtotal: 5000,
      totalAmount: 5000,
      paymentMethod: PaymentProvider.BANK_TRANSFER,
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.PENDING,
      items: {
        create: [
          {
            variantId: variant.id,
            quantity: 1,
            priceAtTime: 5000,
          },
        ],
      },
    },
    include: { items: true },
  });

  // -------------------------------------
  // STOCK RESERVATION
  // -------------------------------------
  await prisma.stockReservation.create({
    data: {
      variantId: variant.id,
      orderId: order.id,
      quantity: 1,
      status: ReservationStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 mins
    },
  });

  // -------------------------------------
  // PAYMENT
  // -------------------------------------
  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: PaymentProvider.BANK_TRANSFER,
      amount: 5000,
      status: PaymentStatus.PENDING,
    },
  });

  // -------------------------------------
  // SHIPMENT
  // -------------------------------------
  await prisma.shipment.create({
    data: {
      orderId: order.id,
      provider: "GIG",
      trackingNumber: "GIG123456",
      status: ShipmentStatus.PENDING,
    },
  });

  // -------------------------------------
  // WHATSAPP ORDER
  // -------------------------------------
  await prisma.whatsAppOrder.create({
    data: {
      phoneNumber: "08098765432",
      status: "PENDING",
      items: {
        create: [
          {
            variantId: variant.id,
            quantity: 2,
            priceAtTime: 5000,
          },
        ],
      },
    },
  });

  // -------------------------------------
  // AUDIT LOG
  // -------------------------------------
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      actorType: "SYSTEM",
      action: "ORDER_CREATED",
      entityType: "Order",
      entityId: order.id,
      metadata: { message: "Order created during seed" },
    },
  });

  // -------------------------------------
  // ORDER STATUS HISTORY
  // -------------------------------------
  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      from: OrderStatus.PENDING,
      to: OrderStatus.PENDING,
      actorType: "SYSTEM",
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
