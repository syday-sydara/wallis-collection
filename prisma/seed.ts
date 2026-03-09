import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "Vibrant Ankara Dress",
      slug: "vibrant-ankara-dress",
      priceNaira: 12000,
      salePriceNaira: 10000,
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
    {
      name: "Wax Print Maxi Skirt",
      slug: "wax-print-maxi-skirt",
      priceNaira: 9000,
      stock: 20,
      category: "Skirts",
      brand: "Wax Elegance",
      sizes: ["S", "M", "L"],
      colors: ["Blue", "Orange"],
      images: [
        "https://images.unsplash.com/photo-1628234989351-0cb1c9c1bb12?auto=format&fit=crop&w=800&q=80"
      ],
      isNew: false,
      isOnSale: false,
      featured: false,
    },
    {
      name: "Elegant Abaya",
      slug: "elegant-abaya",
      priceNaira: 15000,
      stock: 12,
      category: "Abayas",
      brand: "Desert Rose",
      sizes: ["M", "L", "XL"],
      colors: ["Black", "Navy"],
      images: [
        "https://images.unsplash.com/photo-1626402262474-d8025d9114c3?auto=format&fit=crop&w=800&q=80"
      ],
      isNew: true,
      isOnSale: false,
      featured: true,
    },
    {
      name: "African Print Headwrap",
      slug: "african-print-headwrap",
      priceNaira: 2500,
      stock: 50,
      category: "Headwear",
      brand: "WrapItUp",
      sizes: ["One Size"],
      colors: ["Red", "Yellow", "Green"],
      images: [
        "https://images.unsplash.com/photo-1611821808033-8a9cd9c8f372?auto=format&fit=crop&w=800&q=80"
      ],
      isNew: false,
      isOnSale: true,
      featured: false,
    },
    {
      name: "Kaftan with Embroidery",
      slug: "kaftan-with-embroidery",
      priceNaira: 18000,
      stock: 10,
      category: "Kaftans",
      brand: "Royal Threads",
      sizes: ["M", "L", "XL"],
      colors: ["White", "Gold"],
      images: [
        "https://images.unsplash.com/photo-1628303411813-d6f1c3e93fa4?auto=format&fit=crop&w=800&q=80"
      ],
      isNew: true,
      isOnSale: false,
      featured: true,
    },
    {
      name: "Casual Wax Top",
      slug: "casual-wax-top",
      priceNaira: 7000,
      stock: 30,
      category: "Tops",
      brand: "Urban Wax",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blue", "Yellow"],
      images: [
        "https://images.unsplash.com/photo-1628303411800-9d7c3e9e57fa?auto=format&fit=crop&w=800&q=80"
      ],
      isNew: false,
      isOnSale: true,
      featured: false,
    },
    {
      name: "Luxury African Gown",
      slug: "luxury-african-gown",
      priceNaira: 22000,
      stock: 8,
      category: "Gowns",
      brand: "Majestic Wear",
      sizes: ["M", "L", "XL"],
      colors: ["Purple", "Gold"],
      images: [
        "https://images.unsplash.com/photo-1628234989351-0b1c9d1bcd12?auto=format&fit=crop&w=800&q=80"
      ],
      isNew: true,
      isOnSale: true,
      featured: true,
    },
    {
      name: "Men's Dashiki Shirt",
      slug: "mens-dashiki-shirt",
      priceNaira: 8000,
      stock: 25,
      category: "Men",
      brand: "Dashiki World",
      sizes: ["M", "L", "XL"],
      colors: ["Red", "Green", "Blue"],
      images: [
        "https://images.unsplash.com/photo-1611821808030-8b9cd8c9f372?auto=format&fit=crop&w=800&q=80"
      ],
      isNew: false,
      isOnSale: false,
      featured: true,
    },
  ];

  console.log("⏳ Seeding products...");

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description ?? "",
        priceNaira: product.priceNaira,
        salePriceNaira: product.salePriceNaira,
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

    console.log(`✔ Created: ${created.name}`);
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
