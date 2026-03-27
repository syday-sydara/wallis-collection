// app/(store)/checkout/verify/page.tsx
import { redirect } from "next/navigation";

export default function VerifyPage({ searchParams }: { searchParams: { orderId?: string } }) {
  if (!searchParams.orderId) {
    return <p>Invalid verification request.</p>;
  }

  redirect(`/api/checkout/verify?orderId=${searchParams.orderId}`);
}
