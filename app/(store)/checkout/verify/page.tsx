"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [attempts, setAttempts] = useState(0);

  const orderId = searchParams.orderId;

  const verify = useCallback(async () => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    setAttempts(0);

    let cancelled = false;

    for (let attempt = 1; attempt <= 5; attempt++) {
      setAttempts(attempt);

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
          // Optional: small UX delay
          await new Promise((r) => setTimeout(r, 300));
          router.replace(`/checkout/success?orderId=${orderId}`);
          return;
        }

        if (res.status === 202) {
          // Still processing
          await new Promise((r) => setTimeout(r, 1200));
          continue;
        }

        // Unexpected status
        console.warn("Unexpected verify status:", res.status);
        setStatus("error");
        return;
      } catch (err) {
        if (!cancelled) {
          // Retry on network errors
          await new Promise((r) => setTimeout(r, 1200));
        }
      }
    }

    if (!cancelled) setStatus("error");

    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  useEffect(() => {
    verify();
  }, [verify]);

  /* ---------------- UI ---------------- */

  if (status === "error") {
    return (
      <div className="text-center mt-10 space-y-4 animate-fadeIn">
        <p className="text-red-600 text-sm">
          Unable to verify payment. Please contact support if this continues.
        </p>

        <button
          onClick={verify}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
        >
          Retry Verification
        </button>
      </div>
    );
  }

  return (
    <div className="text-center mt-10 space-y-2 animate-pulse">
      <p className="text-text">Verifying your payment…</p>
      <p className="text-xs text-text-muted">Attempt {attempts} of 5</p>
    </div>
  );
}
