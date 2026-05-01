import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      customer: {
        include: {
          user: true,
        },
      },

      address: true,

      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },

      payments: {
        include: {
          provider: true,
        },
      },

      shipment: {
        include: {
          provider: true,
        },
      },

      reservations: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },

      statusHistory: true,
    },
    orderBy: { createdAt: "desc" }, // ⭐ recommended
  });

  console.log(JSON.stringify(orders, null, 2));
}

main().finally(() => prisma.$disconnect());
