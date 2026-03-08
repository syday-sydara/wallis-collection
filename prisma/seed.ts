// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "Vibrant Ankara Dress",
      slug: "vibrant-ankara-dress",
      priceNaira: 12000,
      images: [
        "https://images.unsplash.com/photo-1600180758895-1c2d6f7d6c1a?auto=format&fit=crop&w=800&q=80"
      ],
      isNew: true,
    },
    {
      name: "Wax Print Maxi Skirt",
      slug: "wax-print-maxi-skirt",
      priceNaira: 9000,
      images: [
        "https://images.unsplash.com/photo-1628234989351-0cb1c9c1bb12?auto=format&fit=crop&w=800&q=80"
      ],
    },
    {
      name: "Elegant Abaya",
      slug: "elegant-abaya",
      priceNaira: 15000,
      images: [
        "https://images.unsplash.com/photo-1626402262474-d8025d9114c3?auto=format&fit=crop&w=800&q=80"
      ],
    },
    {
      name: "African Print Headwrap",
      slug: "african-print-headwrap",
      priceNaira: 2500,
      images: [
        "https://images.unsplash.com/photo-1611821808033-8a9cd9c8f372?auto=format&fit=crop&w=800&q=80"
      ],
    },
    {
      name: "Kaftan with Embroidery",
      slug: "kaftan-with-embroidery",
      priceNaira: 18000,
      images: [
        "https://images.unsplash.com/photo-1628303411813-d6f1c3e93fa4?auto=format&fit=crop&w=800&q=80"
      ],
    },
    {
      name: "Casual Wax Top",
      slug: "casual-wax-top",
      priceNaira: 7000,
      images: [
        "https://images.unsplash.com/photo-1628303411800-9d7c3e9e57fa?auto=format&fit=crop&w=800&q=80"
      ],
    },
    {
      name: "Luxury African Gown",
      slug: "luxury-african-gown",
      priceNaira: 22000,
      images: [
        "https://images.unsplash.com/photo-1628234989351-0b1c9d1bcd12?auto=format&fit=crop&w=800&q=80"
      ],
      isOnSale: true,
    },
    {
      name: "Men's Dashiki Shirt",
      slug: "mens-dashiki-shirt",
      priceNaira: 8000,
      images: [
        "https://images.unsplash.com/photo-1611821808030-8b9cd8c9f372?auto=format&fit=crop&w=800&q=80"
      ],
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  console.log("✅ Seeded products successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });