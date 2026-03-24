import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "Vibrant Ankara Dress",
      slug: "vibrant-ankara-dress",
      price: 12000 * 100, // convert Naira to Kobo
      salePrice: 10000 * 100, // convert Naira to Kobo
      stock: 15,
      category: "Dresses",
      brand: "Ankara Couture",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Red", "Yellow", "Blue"],
      images: [
        "https://images.unsplash.com/photo-1600180758895-1c2d6f7d6c1a?auto=format&fit=crop&w=800&q=80"
      ],
      isNew: true,
      isOnSale: true,
      featured: true,
    },
    // Add more products here...
  ];

  console.log("⏳ Seeding products...");

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        // Optional: you can update prices/stock if needed
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        isNew: product.isNew,
        isOnSale: product.isOnSale,
        featured: product.featured,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description ?? "",
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        category: product.category,
        brand: product.brand,
        sizes: product.sizes,
        colors: product.colors,
        isNew: product.isNew,
        isOnSale: product.isOnSale,
        featured: product.featured,

        images: {
          create: product.images.map((url, index) => ({
            url,
            position: index,
          })),
        },
      },
    });

    console.log(`✔ Created or updated: ${created.name}`);
  }

  console.log("🎉 All products seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });