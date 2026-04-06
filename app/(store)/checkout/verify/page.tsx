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

    if (!orderId) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);

          const res = await fetch(`/api/checkout/verify?orderId=${orderId}`, {
            cache: "no-store",
            signal: controller.signal,
          });

          clearTimeout(timeout);
          if (cancelled) return;

          if (res.status === 200) {
            router.replace(`/checkout/success?orderId=${orderId}`);
            return;
          }

          if (res.status === 202) {
            // Payment still processing — retry
            await new Promise((r) => setTimeout(r, 1200));
            continue;
          }

          // Any other status = error
          setStatus("error");
          return;
        } catch {
          if (!cancelled) {
            // Retry on network errors
            await new Promise((r) => setTimeout(r, 1200));
          }
        }
      }

      if (!cancelled) setStatus("error");
    };

    verify();

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