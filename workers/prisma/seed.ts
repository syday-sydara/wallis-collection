import {
  PrismaClient,
  OrderChannel,
  DeliveryMethod,
  PaymentStatus,
  OrderStatus,
  ReservationStatus,
  Currency,
  ShipmentStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // -----------------------------
  // PROVIDERS
  // -----------------------------
  const bankTransfer = await prisma.paymentProvider.create({
    data: {
      code: "BANK_TRANSFER",
      name: "Bank Transfer",
    },
  });

  const gigProvider = await prisma.shipmentProvider.create({
    data: {
      code: "GIG",
      name: "GIG Logistics",
    },
  });

  // -----------------------------
  // USER + CUSTOMER
  // -----------------------------
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      phone: "08012345678",
      email: "test@example.com",
      customer: {
        create: {
          primaryPhone: "08012345678",
        },
      },
    },
    include: { customer: true },
  });

  // -----------------------------
  // PRODUCT + VARIANTS + IMAGES
  // -----------------------------
  const product = await prisma.product.create({
    data: {
      name: "Ankara Fabric",
      slug: "ankara-fabric",
      description: "Beautiful patterned fabric",
      fabricType: "WAX",
      color: "Blue",
      pattern: "Geometric",
      images: {
        create: [{ url: "https://example.com/image.jpg", alt: "Sample image" }],
      },
      variants: {
        create: [
          {
            name: "2 yards",
            sku: "ANK-2Y",
            price: 2500,
            stockQty: 10,
          },
          {
            name: "4 yards",
            sku: "ANK-4Y",
            price: 5000,
            stockQty: 5,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const variant = product.variants[0];

  // -----------------------------
  // ADDRESS
  // -----------------------------
  const address = await prisma.address.create({
    data: {
      line1: "123 Test Street",
      city: "Lagos",
      state: "Lagos",
    },
  });

  // -----------------------------
  // ORDER
  // -----------------------------
  const order = await prisma.order.create({
    data: {
      customerId: user.customer!.id,
      channel: OrderChannel.WHATSAPP,
      phoneNumber: "08012345678",
      addressId: address.id,
      deliveryMethod: DeliveryMethod.DELIVERY,

      subtotal: 5000,
      deliveryFee: 0,
      discount: 0,
      totalAmount: 5000,
      currency: Currency.NGN,

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

      reservations: {
        create: [
          {
            variantId: variant.id,
            quantity: 1,
            status: ReservationStatus.ACTIVE,
            expiresAt: new Date(Date.now() + 1000 * 60 * 30),
          },
        ],
      },

      statusHistory: {
        create: [
          {
            from: OrderStatus.PENDING,
            to: OrderStatus.PENDING,
          },
        ],
      },
    },
  });

  // -----------------------------
  // PAYMENT
  // -----------------------------
  await prisma.payment.create({
    data: {
      orderId: order.id,
      providerId: bankTransfer.id,
      amount: 5000,
      currency: Currency.NGN,
      status: PaymentStatus.PENDING,
    },
  });

  // -----------------------------
  // SHIPMENT
  // -----------------------------
  await prisma.shipment.create({
    data: {
      orderId: order.id,
      providerId: gigProvider.id,
      trackingNumber: "GIG123456",
      status: ShipmentStatus.PENDING,
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
