// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

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
  // Products
  // ---------------------------
  const products = [
    {
      slug: "classic-tshirt",
      name: "Classic T-Shirt",
      basePrice: 2500, // in Kobo (₦25)
      stock: 100,
      description: "Comfortable cotton t-shirt.",
      images: [
        { url: "/images/products/tshirt1.jpg", alt: "Classic T-Shirt Front" },
        { url: "/images/products/tshirt2.jpg", alt: "Classic T-Shirt Back" },
      ],
      variants: [
        { name: "Small / White", sku: "TSHIRT-S-WHITE", price: 2500 },
        { name: "Medium / White", sku: "TSHIRT-M-WHITE", price: 2500 },
        { name: "Large / White", sku: "TSHIRT-L-WHITE", price: 2500 },
      ],
    },
    {
      slug: "denim-jeans",
      name: "Denim Jeans",
      basePrice: 7500, // ₦75
      stock: 50,
      description: "Slim-fit denim jeans.",
      images: [
        { url: "/images/products/jeans1.jpg", alt: "Denim Jeans Front" },
        { url: "/images/products/jeans2.jpg", alt: "Denim Jeans Back" },
      ],
      variants: [
        { name: "32 / Blue", sku: "JEANS-32-BLUE", price: 7500 },
        { name: "34 / Blue", sku: "JEANS-34-BLUE", price: 7500 },
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
        stock: product.stock,
        description: product.description,
        images: { create: product.images },
        variants: { create: product.variants },
      },
    });
  }
  console.log("✅ Products seeded");

  // ---------------------------
  // Fraud Rules
  // ---------------------------
  const fraudRules = [
    {
      name: "high_risk_ip",
      description: "IP address is in a known high-risk list",
      weight: 30,
      condition: { type: "ip_in_list", list: ["41.190.3.22", "102.89.44.10"] },
    },
    {
      name: "email_phone_mismatch",
      description: "Email domain does not match phone region",
      weight: 20,
      condition: { type: "email_phone_mismatch" },
    },
    {
      name: "too_many_attempts",
      description: "User has exceeded safe number of checkout attempts",
      weight: 40,
      condition: { type: "numeric_threshold", metric: "attempts", operator: ">", value: 3 },
    },
    {
      name: "suspicious_user_agent",
      description: "User agent string is unusually short",
      weight: 10,
      condition: { type: "min_user_agent_length", value: 10 },
    },
  ];

  await prisma.fraudRule.createMany({ data: fraudRules });
  console.log("✅ Fraud rules seeded");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });