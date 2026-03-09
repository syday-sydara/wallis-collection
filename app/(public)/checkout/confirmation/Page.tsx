// app/(public)/checkout/confirmation/page.tsx
import { prisma } from "@/lib/db";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import { notFound } from "next/navigation";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;

  if (!orderId) return notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              priceNaira: true,
              images: {
                select: { url: true, position: true },
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
      shipments: {
        include: {
          updates: true,
        },
      },
    },
  });

  if (!order) return notFound();

  // Add fallback image for products with no images
  const normalizedOrder = {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        images:
          item.product?.images?.length > 0
            ? item.product.images
            : [{ url: "/placeholder.png", position: 0 }],
      },
    })),
  };

  return <OrderConfirmation order={normalizedOrder} />;
}
