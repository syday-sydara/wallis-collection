import { prisma } from "@/lib/db"; // Prisma database client

export default async function SuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  // Fetch order details if orderId exists in the searchParams
  const order = searchParams.orderId
    ? await prisma.order.findUnique({
        where: { id: searchParams.orderId }, // Find order by ID
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
        // Display order details if order exists
        <div className="space-y-2">
          <p>Thank you, {order.fullName}.</p>
          <p>Your order <strong>{order.id}</strong> has been received.</p>
          <p>Total: ₦{order.total.toLocaleString()}</p> {/* Format total as currency */}
          <p>Status: {order.paymentStatus}</p> {/* Display payment status */}
        </div>
      ) : (
        // Display an error message if no order was found
        <p>Order not found.</p>
      )}
    </div>
  );
}