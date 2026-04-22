import {
  PrismaClient,
  UserRole,
  Currency,
  PaymentMethod,
  OrderStatus,
  ShippingType,
  PaymentStatus,
} from "@prisma/client";

import { fakeCloudinaryImage } from "./seed-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockLog.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared old data");

  // Users
  await prisma.user.createMany({
    data: [
      { email: "alice@example.com", name: "Alice Johnson", role: UserRole.USER },
      { email: "bob@example.com", name: "Bob Smith", role: UserRole.USER },
    ],
  });

  console.log("✅ Users seeded");

  // Categories
  await prisma.category.createMany({
    data: [
      { name: "Fabrics", slug: "fabrics" },
      { name: "Abayas", slug: "abayas" },
    ],
  });

  const fabricsCategory = await prisma.category.findUnique({ where: { slug: "fabrics" } });
  const abayasCategory = await prisma.category.findUnique({ where: { slug: "abayas" } });

  console.log("✅ Categories seeded");

  // Products
  const products = [
    {
      slug: "wax",
      name: "Wax",
      basePrice: 5000,
      description: "High-quality wax for vibrant prints.",
      categoryId: fabricsCategory!.id,
      images: [
        fakeCloudinaryImage("/images/products/wax1.jpg", "Wax Roll Front", 0),
        fakeCloudinaryImage("/images/products/wax2.jpg", "Wax Roll Back", 1),
      ],
      variants: [
        { name: "Small Roll", sku: "WAX-SMALL", price: 5000, stock: 100 },
        { name: "Large Roll", sku: "WAX-LARGE", price: 9000, stock: 50 },
      ],
    },
    {
      slug: "super-wax",
      name: "Super Wax",
      basePrice: 12000,
      description: "Premium super wax for exceptional prints.",
      categoryId: fabricsCategory!.id,
      images: [
        fakeCloudinaryImage("/images/products/superwax1.jpg", "Super Wax Front", 0),
      ],
      variants: [
        { name: "Single Pack", sku: "SUPERWAX-1", price: 12000, stock: 30 },
        { name: "Pack of 3", sku: "SUPERWAX-3", price: 35000, stock: 20 },
      ],
    },
    {
      slug: "hollands",
      name: "Hollands",
      basePrice: 15000,
      description: "Authentic Hollands fabric.",
      categoryId: fabricsCategory!.id,
      images: [
        fakeCloudinaryImage("/images/products/hollands1.jpg", "Hollands Front", 0),
      ],
      variants: [
        { name: "6 Yards", sku: "HOLLANDS-6", price: 15000, stock: 40 },
        { name: "12 Yards", sku: "HOLLANDS-12", price: 28000, stock: 25 },
      ],
    },
    {
      slug: "abayas",
      name: "Abayas",
      basePrice: 20000,
      description: "Elegant abayas for every occasion.",
      categoryId: abayasCategory!.id,
      images: [
        fakeCloudinaryImage("/images/products/abayas1.jpg", "Abaya Black Front", 0),
        fakeCloudinaryImage("/images/products/abayas2.jpg", "Abaya Black Back", 1),
      ],
      variants: [
        { name: "Medium Black", sku: "ABAYA-M-BLACK", price: 20000, stock: 30 },
        { name: "Large Black", sku: "ABAYA-L-BLACK", price: 22000, stock: 20 },
      ],
    },
  ];

  const allVariants: { id: string; stock: number }[] = [];

  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        description: product.description,
        isPublished: true,
        categories: { connect: { id: product.categoryId } },
        images: { create: product.images },
        variants: {
          create: product.variants.map((v) => ({
            ...v,
            reservedStock: 0,
          })),
        },
      },
      include: { variants: true },
    });

    created.variants.forEach((v) => allVariants.push({ id: v.id, stock: v.stock }));
  }

  console.log("✅ Products seeded");

  // Stock logs
  for (const variant of allVariants) {
    await prisma.stockLog.create({
      data: {
        variantId: variant.id,
        change: variant.stock,
        reason: "Initial stock",
      },
    });
  }

  console.log("✅ Stock logs seeded");

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
