import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@wallis.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@wallis.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  console.log("✔ Admin user created:", admin.email);

  // 2. Regular User
  const userPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "customer@wallis.com" },
    update: {},
    create: {
      name: "John Customer",
      email: "customer@wallis.com",
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log("✔ Customer user created:", user.email);

  // 3. Products
  const sampleProducts = [
    {
      name: "Classic Leather Wallet",
      slug: "classic-leather-wallet",
      description: "Premium handcrafted leather wallet with multiple compartments.",
      priceNaira: 15000,
      stock: 25,
      category: "Accessories",
      images: ["/products/wallet1.jpg", "/products/wallet2.jpg"],
    },
    {
      name: "Luxury Wristwatch",
      slug: "luxury-wristwatch",
      description: "Elegant wristwatch with stainless steel finish.",
      priceNaira: 85000,
      stock: 10,
      category: "Watches",
      images: ["/products/watch1.jpg", "/products/watch2.jpg"],
    },
    {
      name: "Men's Designer Shoes",
      slug: "mens-designer-shoes",
      description: "Comfortable and stylish designer shoes for men.",
      priceNaira: 45000,
      stock: 18,
      category: "Footwear",
      images: ["/products/shoes1.jpg", "/products/shoes2.jpg"],
    },
  ];

  await Promise.all(
    sampleProducts.map((product) =>
      prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      })
    )
  );

  console.log(`✔ Products seeded: ${sampleProducts.length}`);
}

main()
  .then(async () => {
    console.log("🌱 Database seeding completed.");
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error("❌ Seeding error:", err);
    await prisma.$disconnect();
    process.exit(1);
  });