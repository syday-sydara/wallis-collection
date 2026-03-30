"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    if (!searchParams.orderId) return setStatus("error");

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/checkout/verify?orderId=${searchParams.orderId}`);
        if (res.ok) router.replace(`/checkout/success?orderId=${searchParams.orderId}`);
        else setStatus("error");
      } catch {
        setStatus("error");
      }
    };

    verifyPayment();
  }, [searchParams.orderId, router]);

  if (status === "error") return <p>Unable to verify payment. Please contact support.</p>;
  return <p>Verifying your payment… Please wait.</p>;
}