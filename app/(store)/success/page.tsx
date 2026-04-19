import { prisma } from "@/lib/db";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          fullName: true,
          total: true,
          paymentStatus: true,
          createdAt: true,
        },
      })
    : null;

  return (
    <main className="max-w-xl mx-auto px-6 py-12 space-y-8 animate-fadeIn pb-safe">
      <div className="flex flex-col items-center text-center space-y-4">
        <CheckCircle className="h-14 w-14 text-green-600 animate-fadeIn-fast" />

        <h1 className="text-2xl font-semibold">Order Successful</h1>

        {order ? (
          <div className="space-y-2 text-text">
            <p>Thank you, <strong>{order.fullName}</strong>.</p>

            <p>
              Your order <strong>{order.id}</strong> has been received.
            </p>

            <p className="text-lg font-semibold">
              Total: ₦{order.total.toLocaleString()}
            </p>

            <p className="text-sm text-text-muted">
              Status: {order.paymentStatus}
            </p>

            <p className="text-xs text-text-muted">
              Placed on {order.createdAt.toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p className="text-red-600">Order not found.</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="w-full rounded-md bg-primary text-primary-foreground py-3 text-center font-medium active:scale-press transition"
        >
          Continue Shopping
        </Link>

        <Link
          href="/orders"
          className="w-full rounded-md border border-border py-3 text-center font-medium active:scale-press transition"
        >
          View Orders
        </Link>
      </div>
    </main>
  );
}
