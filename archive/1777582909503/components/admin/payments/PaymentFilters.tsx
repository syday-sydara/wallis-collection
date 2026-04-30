// components/admin/payments/PaymentFilters.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PaymentFilters({
  initialStatus,
  initialProvider,
  initialQuery,
  initialMinScore,
  initialMaxScore,
}: any) {
  const router = useRouter();

  const [status, setStatus] = useState(initialStatus ?? "ALL");
  const [provider, setProvider] = useState(initialProvider ?? "ALL");
  const [q, setQ] = useState(initialQuery ?? "");
  const [minScore, setMinScore] = useState(initialMinScore ?? "");
  const [maxScore, setMaxScore] = useState(initialMaxScore ?? "");

  function applyFilters() {
    const params = new URLSearchParams();

    if (status !== "ALL") params.set("status", status);
    if (provider !== "ALL") params.set("provider", provider);
    if (q) params.set("q", q);
    if (minScore) params.set("minScore", minScore);
    if (maxScore) params.set("maxScore", maxScore);

    router.push(`/admin/payments?${params.toString()}`);
  }

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="REVIEW">Review</option>
          <option value="PARTIAL">Partial</option>
          <option value="EXPIRED">Expired</option>
          <option value="REFUNDED">Refunded</option>
          <option value="CHARGEBACK">Chargeback</option>
        </select>

        {/* Provider */}
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="input"
        >
          <option value="ALL">All Providers</option>
          <option value="paystack">Paystack</option>
          <option value="monnify">Monnify</option>
        </select>

        {/* Search */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search reference, order, email, phone"
          className="input"
        />

        {/* Fraud Score Range */}
        <div className="flex gap-2">
          <input
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            placeholder="Min Score"
            className="input"
          />
          <input
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
            placeholder="Max Score"
            className="input"
          />
        </div>
      </div>

      <button onClick={applyFilters} className="btn btn-primary">
        Apply Filters
      </button>
    </div>
  );
}
