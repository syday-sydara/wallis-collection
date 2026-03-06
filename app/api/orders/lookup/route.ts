// app/api/orders/create/route.ts
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { items, userId, total } = await req.json();

  const order = await prisma.order.create({
    data: {
      userId,
      totalNaira: total,
      status: "PENDING",
      items: {
        create: items.map((i: any) => ({
          productId: i.id,
          quantity: i.quantity,
          priceNaira: i.price,
        })),
      },
    },
  });

  return Response.json(order);
}