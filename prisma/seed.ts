// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ---------------------------
  // Users
  // ---------------------------
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice Johnson",
      role: "USER"
    }
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob Smith",
      role: "USER"
    }
  });

  console.log("Created users:", [alice.email, bob.email]);

  // ---------------------------
  // Products
  // ---------------------------
  const product1 = await prisma.product.upsert({
    where: { slug: "classic-tshirt" },
    update: {},
    create: {
      name: "Classic T-Shirt",
      slug: "classic-tshirt",
      basePrice: 2500, // in Kobo (₦25)
      stock: 100,
      description: "Comfortable cotton t-shirt.",
      images: {
        create: [
          { url: "/images/products/tshirt1.jpg", alt: "Classic T-Shirt Front" },
          { url: "/images/products/tshirt2.jpg", alt: "Classic T-Shirt Back" }
        ]
      },
      variants: {
        create: [
          { name: "Small / White", sku: "TSHIRT-S-WHITE", price: 2500 },
          { name: "Medium / White", sku: "TSHIRT-M-WHITE", price: 2500 },
          { name: "Large / White", sku: "TSHIRT-L-WHITE", price: 2500 }
        ]
      }
    }
  });

  const product2 = await prisma.product.upsert({
    where: { slug: "denim-jeans" },
    update: {},
    create: {
      name: "Denim Jeans",
      slug: "denim-jeans",
      basePrice: 7500, // ₦75
      stock: 50,
      description: "Slim-fit denim jeans.",
      images: {
        create: [
          { url: "/images/products/jeans1.jpg", alt: "Denim Jeans Front" },
          { url: "/images/products/jeans2.jpg", alt: "Denim Jeans Back" }
        ]
      },
      variants: {
        create: [
          { name: "32 / Blue", sku: "JEANS-32-BLUE", price: 7500 },
          { name: "34 / Blue", sku: "JEANS-34-BLUE", price: 7500 }
        ]
      }
    }
  });

  console.log("Created products:", [product1.name, product2.name]);

  // ---------------------------
  // Fraud Rules
  // ---------------------------
  await prisma.fraudRule.createMany({
    data: [
      {
        name: "high_risk_ip",
        description: "IP address is in a known high-risk list",
        weight: 30,
        condition: {
          type: "ip_in_list",
          list: ["41.190.3.22", "102.89.44.10"]
        }
      },
      {
        name: "email_phone_mismatch",
        description: "Email domain does not match phone region",
        weight: 20,
        condition: {
          type: "email_phone_mismatch"
        }
      },
      {
        name: "too_many_attempts",
        description: "User has exceeded safe number of checkout attempts",
        weight: 40,
        condition: {
          type: "numeric_threshold",
          metric: "attempts",
          operator: ">",
          value: 3
        }
      },
      {
        name: "suspicious_user_agent",
        description: "User agent string is unusually short",
        weight: 10,
        condition: {
          type: "min_user_agent_length",
          value: 10
        }
      }
    ]
  });

  console.log("Fraud rules seeded ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });