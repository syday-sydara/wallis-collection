import OrderConfirmation from "@/components/checkout/OrderConfirmation";

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId || "N/A";

  return <OrderConfirmation orderId={orderId} />;
}