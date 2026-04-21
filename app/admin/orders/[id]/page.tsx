import { prisma } from "@/lib/prisma";
import OrderDetail from "@/components/admin/orders/OrderDetail";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      payments: true,
    },
  });

  if (!order) {
    return <div className="p-6">Order not found.</div>;
  }

  return <OrderDetail order={order} />;
}
