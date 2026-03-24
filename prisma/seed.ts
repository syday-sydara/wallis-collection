import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with Argon2 password hashing...");

  // Create admin user
  const adminPassword = await argon2.hash("admin123");

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

  console.log("👤 Admin user created:", admin.email);

  // Sample product
  const product1 = await prisma.product.create({
    data: {
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

  console.log("👜 Sample product created:", product1.name);

  // Delivery zones (Nigeria‑specific)
  await prisma.deliveryZone.createMany({
    data: [
      { state: "Lagos", lga: "Ikeja", fee: 1500 },
      { state: "Lagos", lga: "Lekki", fee: 2000 },
      { state: "Abuja", lga: "Garki", fee: 2500 },
    ],
  });

  console.log("🚚 Delivery zones seeded");

  // Inventory movement
  await prisma.inventoryMovement.create({
    data: {
      productId: product1.id,
      change: 20,
      reason: "RESTOCK",
    },
  });

  console.log("📦 Inventory movement logged");

  console.log("🌱 Seed completed successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });