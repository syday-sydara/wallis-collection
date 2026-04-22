"use client";

import { useState, useEffect } from "react";

export default function RiderUpdatePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("f");
    const s = params.get("s");
    const t = params.get("t");

    if (!f || !s || !t) {
      setError("Invalid link.");
      setLoading(false);
      return;
    }

    fetch(`/api/rider/view?f=${f}&s=${s}&t=${t}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) {
          setError("Invalid or expired link.");
        } else {
          setData(json);
        }
        setLoading(false);
      });
  }, []);

  async function submit(status: "DELIVERED" | "FAILED") {
    setSubmitting(true);

    const params = new URLSearchParams(window.location.search);
    const f = params.get("f");
    const t = params.get("t");

    const res = await fetch(`/api/rider/update`, {
      method: "POST",
      body: JSON.stringify({ f, status, t }),
    });

    const json = await res.json();
    if (!json.ok) {
      setError("Could not update status.");
    } else {
      setData({ ...data, updated: true, status });
    }

    setSubmitting(false);
  }

  if (loading) return <div className="p-6 text-center">Loading…</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  const order = data.order;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Rider Delivery Update</h1>

      <div className="card p-4 space-y-2">
        <div className="text-sm text-gray-500">Order</div>
        <div className="font-medium">#{order.id.slice(0, 8)}</div>

        <div className="text-sm text-gray-500">Customer</div>
        <div>{order.fullName}</div>

        <div className="text-sm text-gray-500">Phone</div>
        <div>{order.phone}</div>

        {order.deliveryNotes && (
          <>
            <div className="text-sm text-gray-500">Notes</div>
            <div>{order.deliveryNotes}</div>
          </>
        )}
      </div>

      {!data.updated ? (
        <div className="space-y-3">
          <button
            className="btn btn-primary w-full"
            disabled={submitting}
            onClick={() => submit("DELIVERED")}
          >
            Mark as Delivered
          </button>

          <button
            className="btn w-full bg-red-600 text-white"
            disabled={submitting}
            onClick={() => submit("FAILED")}
          >
            Mark as Failed
          </button>
        </div>
      ) : (
        <div className="p-4 text-center bg-green-50 rounded-md">
          <div className="font-medium">
            Status updated: {data.status}
          </div>
        </div>
      )}
    </div>
  );
}
