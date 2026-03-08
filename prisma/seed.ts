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
    name: "African Wax Print Fabric – Blue Sunrise",
    slug: "wax-blue-sunrise",
    description:
      "Vibrant African wax print fabric featuring bold blue and yellow sunburst patterns. Ideal for dresses, skirts, and headwraps.",
    priceCents: 12000 * 100,
    stock: 40,
    category: "Wax",
    images: [
      "https://images.unsplash.com/photo-1589927986089-35812388d1f4",
      "https://images.unsplash.com/photo-1589927986100-5e1b2c718376",
    ],
  },
  {
    name: "Holland Super Wax – Royal Gold Edition",
    slug: "super-wax-royal-gold",
    description:
      "Premium super‑wax fabric with deep indigo tones and gold geometric accents. High‑quality cotton with long‑lasting color.",
    priceCents: 35000 * 100,
    stock: 20,
    category: "Super Wax",
    images: [
      "https://images.unsplash.com/photo-1604335399105-0d7d87f5a7b1",
      "https://images.unsplash.com/photo-1604335398891-8c1e7c3d6c02",
    ],
  },
  {
    name: "Ankara Floral Harmony",
    slug: "ankara-floral-harmony",
    description:
      "Soft Ankara fabric with a modern floral pattern. Perfect for gowns, blouses, and children’s wear.",
    priceCents: 9000 * 100,
    stock: 50,
    category: "Ankara",
    images: [
      "https://images.unsplash.com/photo-1589927986095-3e1b2c718376",
      "https://images.unsplash.com/photo-1589927986102-35812388d1f4",
    ],
  },
  {
    name: "Bold Ankara Circles",
    slug: "ankara-bold-circles",
    description:
      "Eye‑catching Ankara print with circular motifs in red, black, and gold. A favorite for statement outfits.",
    priceCents: 11000 * 100,
    stock: 35,
    category: "Ankara",
    images: [
      "https://images.unsplash.com/photo-1604335398891-8c1e7c3d6c02",
      "https://images.unsplash.com/photo-1604335399105-0d7d87f5a7b1",
    ],
  },
  {
    name: "Classic Wax Spiral Pattern",
    slug: "wax-spiral-pattern",
    description:
      "Traditional African wax print featuring spirals and tribal motifs. Durable and colorfast.",
    priceCents: 15000 * 100,
    stock: 28,
    category: "Wax",
    images: [
      "https://images.unsplash.com/photo-1589927986100-5e1b2c718376",
      "https://images.unsplash.com/photo-1589927986089-35812388d1f4",
    ],
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