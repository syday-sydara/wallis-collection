// prisma/seed.ts
import { PrismaClient, UserRole, Currency, PaymentMethod, OrderStatus, ShippingType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---------------------------
  // Clear existing data
  // ---------------------------
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.stockLog.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("🧹 Cleared old data");

  // ---------------------------
  // Users
  // ---------------------------
  const users = [
    { email: "alice@example.com", name: "Alice Johnson", role: UserRole.USER },
    { email: "bob@example.com", name: "Bob Smith", role: UserRole.USER },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  console.log("✅ Users seeded");

  // ---------------------------
  // Products + Variants + Images
  // ---------------------------
  const products = [
    {
      slug: "wax",
      name: "Wax",
      basePrice: 5000,
      description: "High-quality wax for vibrant prints.",
      images: [
        { url: "/images/products/wax1.jpg", alt: "Wax Roll Front" },
        { url: "/images/products/wax2.jpg", alt: "Wax Roll Back" },
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
      images: [
        { url: "/images/products/superwax1.jpg", alt: "Super Wax Front" },
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
      images: [
        { url: "/images/products/hollands1.jpg", alt: "Hollands Front" },
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
      images: [
        { url: "/images/products/abayas1.jpg", alt: "Abaya Black Front" },
        { url: "/images/products/abayas2.jpg", alt: "Abaya Black Back" },
      ],
      variants: [
        { name: "Medium Black", sku: "ABAYA-M-BLACK", price: 20000, stock: 30 },
        { name: "Large Black", sku: "ABAYA-L-BLACK", price: 22000, stock: 20 },
      ],
    },
  ];

  const allVariants: { id: string; stock: number }[] = [];

  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        description: product.description,
        images: { create: product.images },
        variants: { create: product.variants.map(v => ({ ...v, reservedStock: 0 })) },
      },
      include: { variants: true },
    });

    createdProduct.variants.forEach(v => allVariants.push({ id: v.id, stock: v.stock }));
  }
  console.log("✅ Products seeded");

  // ---------------------------
  // Stock Logs
  // ---------------------------
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

  // ---------------------------
  // Sample Orders
  // ---------------------------
  const alice = await prisma.user.findUnique({ where: { email: "alice@example.com" } });
  const waxVariant = await prisma.productVariant.findUnique({ where: { sku: "WAX-SMALL" } });
  const abayaVariant = await prisma.productVariant.findUnique({ where: { sku: "ABAYA-M-BLACK" } });

  if (alice && waxVariant && abayaVariant) {
    const uniqueReference = `TEST-${Date.now()}`; // ✅ unique payment reference

    await prisma.order.create({
      data: {
        email: alice.email,
        phone: "+2348000000001",
        fullName: alice.name!,
        subtotal: waxVariant.price + abayaVariant.price,
        shippingCost: 2000,
        total: waxVariant.price + abayaVariant.price + 2000,
        currency: Currency.NGN,
        paymentMethod: PaymentMethod.TRANSFER,
        orderStatus: OrderStatus.CREATED,
        shippingType: ShippingType.STANDARD,
        shippingAddress: { line1: "123 Lagos Street", city: "Lagos", state: "Lagos", country: "Nigeria" },
        cartSnapshot: {
          items: [
            { variantId: waxVariant.id, name: waxVariant.name, quantity: 1, unitPrice: waxVariant.price },
            { variantId: abayaVariant.id, name: abayaVariant.name, quantity: 1, unitPrice: abayaVariant.price },
          ],
        },
        userId: alice.id,
        items: {
          create: [
            { productId: waxVariant.productId, variantId: waxVariant.id, name: waxVariant.name, attributes: {}, quantity: 1, unitPrice: waxVariant.price },
            { productId: abayaVariant.productId, variantId: abayaVariant.id, name: abayaVariant.name, attributes: {}, quantity: 1, unitPrice: abayaVariant.price },
          ],
        },
        payments: {
          create: [
            {
              provider: "Bank Transfer",
              reference: uniqueReference,
              amount: waxVariant.price + abayaVariant.price + 2000,
              currency: Currency.NGN,
              status: "INITIATED",
              raw: {},
            },
          ],
        },
      },
    });
  }
  console.log("✅ Sample orders seeded");

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