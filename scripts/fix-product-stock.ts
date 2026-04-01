// scripts/fix-product-stock.ts
import { prisma } from "@/lib/db";

async function main() {
  console.log("Starting product stock migration...");

  // Fetch all products with their inventory movements
  const products = await prisma.product.findMany({
    include: {
      inventory: {
        select: {
          change: true,
        },
      },
    },
  });

  console.log(`Found ${products.length} products. Updating stock...`);

  for (const product of products) {
    const stock = product.inventory.reduce((sum, m) => sum + m.change, 0);

    await prisma.product.update({
      where: { id: product.id },
      data: { stock },
    });
  }

  console.log("Migration completed! All product stocks updated.");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });