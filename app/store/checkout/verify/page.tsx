"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [attempts, setAttempts] = useState(0);

  const orderId = searchParams.orderId;
  const cancelledRef = useRef(false);

  const verify = useCallback(async () => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    cancelledRef.current = false;
    setStatus("loading");
    setAttempts(0);

    const maxAttempts = 5;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (cancelledRef.current) return;

      setAttempts(attempt);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(`/api/checkout/verify?orderId=${orderId}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (cancelledRef.current) return;

        if (res.status === 200) {
          // Optional UX delay
          await new Promise((r) => setTimeout(r, 300));
          setStatus("success");
          router.replace(`/checkout/success?orderId=${orderId}`);
          return;
        }

        if (res.status === 202) {
          // Exponential backoff: 1.2s → 1.6s → 2.4s → ...
          const delay = 1200 * Math.pow(1.2, attempt);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        // Unexpected status
        console.warn("Unexpected verify status:", res.status);
        setStatus("error");
        return;
      } catch (err) {
        if (!cancelledRef.current) {
          // Retry on network errors
          await new Promise((r) => setTimeout(r, 1200));
        }
      }
    }

    if (!cancelledRef.current) {
      setStatus("error");
    }
  }, [orderId, router]);

  useEffect(() => {
    verify();

    return () => {
      cancelledRef.current = true;
    };
  }, [verify]);

  /* ---------------- UI ---------------- */

  if (status === "error") {
    return (
      <div className="text-center mt-10 space-y-4 animate-fadeIn">
        <p className="text-danger text-sm">
          Unable to verify payment. Please contact support if this continues.
        </p>

        <button
          onClick={verify}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm active:scale-95 transition"
        >
          Retry Verification
        </button>
      </div>
    );
  }

  return (
    <div className="text-center mt-10 space-y-2 animate-pulse">
      <p className="text-text-primary">Verifying your payment…</p>
      <p className="text-xs text-text-secondary">Attempt {attempts} of 5</p>
    </div>
  );
}
