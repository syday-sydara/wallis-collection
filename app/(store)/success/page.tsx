// app/(store)/checkout/success/page.tsx
import { prisma } from "@/lib/db";

export default async function SuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const order = searchParams.orderId
    ? await prisma.order.findUnique({
        where: { id: searchParams.orderId },
        select: {
          id: true,
          fullName: true,
          total: true,
          paymentStatus: true,
          createdAt: true
        }
      })
    : null;

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Order Successful</h1>

      {order ? (
        <div className="space-y-2">
          <p>Thank you, {order.fullName}.</p>
          <p>Your order <strong>{order.id}</strong> has been received.</p>
          <p>Total: ₦{order.total.toLocaleString()}</p>
          <p>Status: {order.paymentStatus}</p>
        </div>
      ) : (
        <p>Order not found.</p>
      )}
    </div>
  );
}
