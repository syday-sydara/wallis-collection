"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const ORDER_STATUS_OPTIONS = [
  "ALL",
  "CREATED",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
];

export default function OrderFilters({
  initialStatus,
  initialPaymentStatus,
  initialQuery,
}: {
  initialStatus?: string;
  initialPaymentStatus?: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(initialStatus || "ALL");
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus || "ALL");
  const [q, setQ] = useState(initialQuery || "");

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (status && status !== "ALL") params.set("status", status);
    else params.delete("status");

    if (paymentStatus && paymentStatus !== "ALL")
      params.set("paymentStatus", paymentStatus);
    else params.delete("paymentStatus");

    if (q) params.set("q", q);
    else params.delete("q");

    router.push(`/admin/orders?${params.toString()}`);
  }

  function resetFilters() {
    setStatus("ALL");
    setPaymentStatus("ALL");
    setQ("");
    router.push("/admin/orders");
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div>
          <label className="block text-xs font-medium mb-1">Order Status</label>
          <select
            className="input !px-2 !py-1 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {ORDER_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Payment Status</label>
          <select
            className="input !px-2 !py-1 text-sm"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            {PAYMENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="md:min-w-[220px]">
          <label className="block text-xs font-medium mb-1">Search</label>
          <input
            className="input !px-2 !py-1 text-sm w-full"
            placeholder="Email, phone, name, order ID"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-outline btn-sm" onClick={resetFilters}>
          Reset
        </button>
        <button className="btn btn-primary btn-sm" onClick={applyFilters}>
          Apply
        </button>
      </div>
    </div>
  );
}
