import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // -----------------------------
  // USERS
  // -----------------------------
  const password = await bcrypt.hash("password123", 10);

  const customer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      phone: "+1234567890",
      password,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      phone: "+1987654321",
      password,
    },
  });

  // -----------------------------
  // PRODUCTS
  // -----------------------------
  const categories = ["electronics", "gaming", "home", "fashion", "fitness"];

  const products = await Promise.all(
    Array.from({ length: 20 }).map(async (_, i) => {
      const name = `Product ${i + 1}`;
      const slug = `product-${i + 1}`;
      const category = categories[i % categories.length];

      return prisma.product.create({
        data: {
          name,
          slug,
          category,
          description: `Description for ${name}`,
          priceCents: Math.floor(Math.random() * 50000) + 5000,
          stock: Math.floor(Math.random() * 100),
          images: [`https://picsum.photos/seed/${slug}/600/600`],
        },
      });
    })
  );

  // -----------------------------
  // ORDERS + ORDER ITEMS
  // -----------------------------
  const orders = await Promise.all(
    Array.from({ length: 12 }).map(async () => {
      const product = products[Math.floor(Math.random() * products.length)];

      const quantity = Math.floor(Math.random() * 3) + 1;
      const total = product.priceCents * quantity;

      return prisma.order.create({
        data: {
          userId: customer.id,
          email: customer.email,
          phone: customer.phone,
          status: "PENDING",
          paymentMethod: "paystack",
          totalCents: total,
          items: {
            create: [
              {
                productId: product.id,
                quantity,
                priceCents: product.priceCents,
              },
            ],
          },
        },
        include: { items: true },
      });
    })
  );

  // -----------------------------
  // REFUND REQUESTS
  // -----------------------------
  const refundOrders = orders.slice(0, 3);

  await Promise.all(
    refundOrders.map((order) =>
      prisma.refundRequest.create({
        data: {
          orderId: order.id,
          reason: "Item damaged on arrival",
          status: "PENDING",
        },
      })
    )
  );

  // -----------------------------
  // FRAUD SIGNALS
  // -----------------------------
  await Promise.all(
    orders.map((order) =>
      prisma.fraudSignal.create({
        data: {
          orderId: order.id,
          score: Math.floor(Math.random() * 100),
          details: {
            ip: "192.168.1.1",
            riskFactors: ["velocity", "location_mismatch"],
          },
        },
      })
    )
  );

  // -----------------------------
  // PUSH SUBSCRIPTIONS
  // -----------------------------
  await prisma.pushSubscription.create({
    data: {
      userId: customer.id,
      endpoint: "https://example.com/push/123",
      p256dh: "fake_p256dh_key",
      auth: "fake_auth_key",
    },
  });

  console.log("🌱 Seed complete!");
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });