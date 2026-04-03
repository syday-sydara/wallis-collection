// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---------------------------
  // Users
  // ---------------------------
  const users = [
    { email: "alice@example.com", name: "Alice Johnson", role: "USER" },
    { email: "bob@example.com", name: "Bob Smith", role: "USER" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log("✅ Users seeded");

  // ---------------------------
  // Products + Variants + Images
  // ---------------------------
  const products = [
    {
      slug: "classic-tshirt",
      name: "Classic T-Shirt",
      basePrice: 2500, // Kobo
      description: "Comfortable cotton t-shirt.",
      images: [
        { url: "/images/products/tshirt1.jpg", alt: "Classic T-Shirt Front" },
        { url: "/images/products/tshirt2.jpg", alt: "Classic T-Shirt Back" },
      ],
      variants: [
        { name: "Small / White", sku: "TSHIRT-S-WHITE", price: 2500, stock: 100 },
        { name: "Medium / White", sku: "TSHIRT-M-WHITE", price: 2500, stock: 100 },
        { name: "Large / White", sku: "TSHIRT-L-WHITE", price: 2500, stock: 100 },
      ],
    },
    {
      slug: "denim-jeans",
      name: "Denim Jeans",
      basePrice: 7500,
      description: "Slim-fit denim jeans.",
      images: [
        { url: "/images/products/jeans1.jpg", alt: "Denim Jeans Front" },
        { url: "/images/products/jeans2.jpg", alt: "Denim Jeans Back" },
      ],
      variants: [
        { name: "32 / Blue", sku: "JEANS-32-BLUE", price: 7500, stock: 50 },
        { name: "34 / Blue", sku: "JEANS-34-BLUE", price: 7500, stock: 50 },
      ],
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        description: product.description,
        images: { create: product.images },
        variants: { create: product.variants },
      },
    });
  }
  console.log("✅ Products seeded");

  console.log("🌱 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
