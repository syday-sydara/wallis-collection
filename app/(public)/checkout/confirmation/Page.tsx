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
      items: true,
    },
  });

  if (!order) return notFound();

  return <OrderConfirmation order={order} />;
}