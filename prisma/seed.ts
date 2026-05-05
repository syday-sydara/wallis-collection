import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Helpers
function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function randomPrice(min = 8000, max = 150000) {
  return Math.floor(Math.random() * (max - min) + min);
}

function randomStock() {
  return Math.floor(Math.random() * 50) + 5;
}

async function main() {
  console.log("🌱 Seeding full system...");

  // ------------------------------------------------------
  // ADMIN USER
  // ------------------------------------------------------
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
    },
  });

  // ------------------------------------------------------
  // PRODUCT CATALOG (24 products, 100+ variants)
  // ------------------------------------------------------
  const categories = [
    "Ankara",
    "Super Wax",
    "Hollandais",
    "Abaya",
    "Kaftan",
    "Lace",
    "Swiss Voile",
    "Adire",
    "Atiku",
    "George Wrapper",
    "Chiffon",
    "Silk",
  ];

  const colors = [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Purple",
    "Black",
    "White",
    "Gold",
    "Brown",
    "Orange",
  ];

  const lengths = ["2 yards", "4 yards", "6 yards", "Full Set"];

  const products: any[] = [];

  for (let i = 0; i < 24; i++) {
    const category = faker.helpers.arrayElement(categories);
    const name = `${category} Fabric – ${faker.commerce.productAdjective()}`;
    const slug = slugify(name + "-" + faker.string.alphanumeric(6));

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: faker.commerce.productDescription(),
      },
    });

    const variantCount = Math.floor(Math.random() * 4) + 3;

    for (let v = 0; v < variantCount; v++) {
      const color = faker.helpers.arrayElement(colors);
      const length = faker.helpers.arrayElement(lengths);

      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
          name: `${color} – ${length}`,
          price: randomPrice(),
          currency: "NGN",
          stockQty: randomStock(),
          isActive: true,
        },
      });
    }

    products.push(product);
  }

  console.log("✔ Products + Variants seeded");

  // ------------------------------------------------------
  // PICK RANDOM VARIANT FOR ORDER FLOW
  // ------------------------------------------------------
  const randomVariant = await prisma.productVariant.findFirst();
  if (!randomVariant) throw new Error("No variants found");

  // ------------------------------------------------------
  // RESERVATION
  // ------------------------------------------------------
  const reservation = await prisma.stockReservation.create({
    data: {
      variantId: randomVariant.id,
      quantity: 1,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  console.log("✔ Reservation created");

  // ------------------------------------------------------
  // ORDER
  // ------------------------------------------------------
  const order = await prisma.order.create({
    data: {
      phoneNumber: "+2348012345678",
      addressLine1: "12 Adeola Odeku Street",
      city: "Victoria Island",
      state: "Lagos",
      lga: "Eti-Osa",
      subtotal: randomVariant.price,
      deliveryFee: 2000,
      discount: 0,
      totalAmount: randomVariant.price + 2000,
      paymentMethod: "BANK_TRANSFER",
      paymentStatus: "PENDING",
      status: "PENDING",
      currency: "NGN",

      items: {
        create: [
          {
            variantId: randomVariant.id,
            quantity: 1,
            price: randomVariant.price,
          },
        ],
      },

      stockReservations: {
        connect: { id: reservation.id },
      },
    },
  });

  console.log("✔ Order created");

  // ------------------------------------------------------
  // PAYMENT
  // ------------------------------------------------------
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "BANK_TRANSFER",
      amount: order.totalAmount,
      currency: "NGN",
      status: "PENDING",
    },
  });

  console.log("✔ Payment created");

  // ------------------------------------------------------
  // SHIPMENT
  // ------------------------------------------------------
  await prisma.shipment.create({
    data: {
      orderId: order.id,
      provider: "GIG Logistics",
      trackingNumber: faker.string.alphanumeric(12).toUpperCase(),
      status: "PENDING",
    },
  });

  console.log("✔ Shipment created");

  // ------------------------------------------------------
  // WHATSAPP ORDER
  // ------------------------------------------------------
  await prisma.whatsAppOrder.create({
    data: {
      phoneNumber: "+2348012345678",
      status: "PENDING",
      state: "Lagos",
      city: "Ikeja",
      items: {
        create: [
          {
            variantId: randomVariant.id,
            quantity: 1,
            priceAtTime: randomVariant.price,
          },
        ],
      },
    },
  });

  console.log("✔ WhatsApp order created");

  // ------------------------------------------------------
  // AUDIT LOG
  // ------------------------------------------------------
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      actorType: "ADMIN",
      action: "SEED_FULL_SYSTEM",
      entityType: "SYSTEM",
      entityId: "INIT",
      metadata: { message: "Full system seed completed" },
    },
  });

  console.log("✔ Audit log created");

  console.log("🎉 FULL SEED COMPLETED SUCCESSFULLY!");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
