import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user (idempotent)
  const adminPassword = await argon2.hash(
    process.env.ADMIN_PASSWORD || "admin123"
  );

  const admin = await prisma.user.upsert({
    where: { email: "admin@shop.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@shop.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("👤 Admin:", admin.email);

  // Product (idempotent)
  const product1 = await prisma.product.upsert({
    where: { slug: "classic-leather-bag" },
    update: {},
    create: {
      name: "Classic Leather Bag",
      slug: "classic-leather-bag",
      price: 35000,
      salePrice: 30000,
      stock: 20,
      category: "Bags",
      brand: "Wallis",
      isNew: true,
      isOnSale: true,

      images: {
        create: [
          { url: "/seed/bag1.jpg", position: 1 },
          { url: "/seed/bag1-2.jpg", position: 2 },
        ],
      },

      variants: {
        create: [
          { size: "M", color: "Brown", stock: 10 },
          { size: "L", color: "Black", stock: 10 },
        ],
      },
    },
  });

  console.log("👜 Product:", product1.name);

  // Delivery zones (safe)
  await prisma.deliveryZone.createMany({
    data: [
      { state: "Lagos", lga: "Ikeja", fee: 1500 },
      { state: "Lagos", lga: "Lekki", fee: 2000 },
      { state: "Abuja", lga: "Garki", fee: 2500 },
    ],
    skipDuplicates: true,
  });

  console.log("🚚 Delivery zones seeded");

  // Inventory (avoid duplication)
  const existingInventory = await prisma.inventoryMovement.findFirst({
    where: { productId: product1.id },
  });

  if (!existingInventory) {
    await prisma.inventoryMovement.create({
      data: {
        productId: product1.id,
        change: 20,
        reason: "RESTOCK",
      },
    });

    console.log("📦 Inventory logged");
  }

  console.log("✅ Seed completed!");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });