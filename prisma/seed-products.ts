import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

faker.seed(42); // deterministic results

// Nigerian fashion categories
const CATEGORIES = [
  "Ankara",
  "Super‑Wax",
  "Abaya",
  "Kaftan",
  "Lace",
  "Hollandais",
  "Ready‑to‑Wear",
  "Men’s Kaftan",
  "Aso‑Oke",
];

// Common fabric colors
const COLORS = [
  "Red",
  "Blue",
  "Black",
  "Gold",
  "Green",
  "Purple",
  "Brown",
  "Multi‑color",
];

// Common sizes for fabrics & clothing
const SIZES = ["S", "M", "L", "XL", "2 Yards", "4 Yards", "6 Yards"];

function randomImage() {
  return `https://images.unsplash.com/photo-${faker.number.int({
    min: 1500000000000,
    max: 1700000000000,
  })}?q=80&w=1200&auto=format&fit=crop`;
}

function generateSKU(name: string, size: string, color: string) {
  const base = `${name.slice(0, 3)}-${size}-${color}`
    .replace(/\s+/g, "")
    .replace(/[^A-Za-z0-9\-]/g, "")
    .toUpperCase();

  const random = faker.string.alphanumeric(4).toUpperCase();

  return `${base}-${random}`;
}


async function main() {
  console.log("🌿 Generating 50 Fermine‑styled products...");

  for (let i = 0; i < 50; i++) {
    const name = faker.commerce.productName() + " " + faker.word.adjective();

const baseSlug = faker.helpers.slugify(name).toLowerCase();
const slug = `${baseSlug}-${faker.string.alphanumeric(6).toLowerCase()}`;


    const category = faker.helpers.arrayElement(CATEGORIES);
    const brand = faker.helpers.arrayElement(["Wallis", "Hollandais", "Vlisco", "Custom"]);

    const price = faker.number.int({ min: 8000, max: 60000 });
    const salePrice = faker.datatype.boolean() ? price - faker.number.int({ min: 500, max: 5000 }) : null;

    const isNew = faker.datatype.boolean();
    const featured = faker.datatype.boolean();

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: faker.commerce.productDescription(),
        price,
        salePrice,
        category,
        brand,
        isNew,
        featured,
        metadata: {
          fabricOrigin: faker.helpers.arrayElement(["Nigeria", "Ghana", "Benin", "Togo"]),
          patternStyle: faker.helpers.arrayElement(["Floral", "Geometric", "Tribal", "Abstract"]),
        },

        images: {
          create: Array.from({ length: 3 }).map((_, idx) => ({
            url: randomImage(),
            position: idx,
          })),
        },

        variants: {
          create: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }).map(() => {
            const size = faker.helpers.arrayElement(SIZES);
            const color = faker.helpers.arrayElement(COLORS);

            return {
              size,
              color,
              stock: faker.number.int({ min: 0, max: 20 }),
              sku: generateSKU(name, size, color),
              metadata: {
                batch: faker.string.alphanumeric(6).toUpperCase(),
              },
            };
          }),
        },
      },
    });

    console.log(`🧵 Created product ${i + 1}/50 → ${product.name}`);
  }

  console.log("🎉 Product generation complete!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
