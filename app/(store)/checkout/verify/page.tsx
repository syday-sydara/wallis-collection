"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const orderId = searchParams.orderId;

    if (!orderId || typeof orderId !== "string") {
      setStatus("error");
      return;
    }

    let cancelled = false;

    const verifyPayment = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(`/api/checkout/verify?orderId=${orderId}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (cancelled) return;

        if (res.ok) {
          router.replace(`/checkout/success?orderId=${orderId}`);
        } else {
          setStatus("error");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [searchParams.orderId, router]);

  if (status === "error") {
    return (
      <p className="text-center text-red-600 mt-10">
        Unable to verify payment. Please contact support.
      </p>
    );
  }

  return (
    <p className="text-center mt-10 animate-pulse">
      Verifying your payment… Please wait.
    </p>
  );
}