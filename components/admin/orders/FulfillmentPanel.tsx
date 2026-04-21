"use client";

import { useState, useTransition } from "react";
import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";
import { useRouter } from "next/navigation";

type Fulfillment = {
  id: string;
  carrier: string | null;
  tracking: string | null;
  status: string;
};

export default function FulfillmentPanel({
  order,
  fulfillments,
}: {
  order: any;
  fulfillments: Fulfillment[];
}) {
  const router = useRouter();
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [isPending, startTransition] = useTransition();

  function createFulfillment() {
    if (!carrier.trim() || !tracking.trim()) return;

    startTransition(async () => {
      try {
        await admin.fulfillment.create(order.id, carrier.trim(), tracking.trim());
        toast.success("Fulfillment created");
        setCarrier("");
        setTracking("");
        router.refresh();
      } catch {
        toast.error("Failed to create fulfillment");
      }
    });
  }

  function updateStatus(id: string, status: string) {
    startTransition(async () => {
      try {
        await admin.fulfillment.updateStatus(id, status);
        toast.success("Fulfillment updated");
        router.refresh();
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  return (
    <div className="border border-border-default rounded-md p-4 space-y-4">
      <h2 className="font-medium text-sm">Fulfillment</h2>

      <div className="flex flex-wrap gap-2">
        <input
          className="input flex-1"
          placeholder="Carrier (e.g. DHL)"
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
        />
        <input
          className="input flex-1"
          placeholder="Tracking number"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={createFulfillment}
          disabled={isPending}
        >
          Create
        </button>
      </div>

      <div className="space-y-3">
        {fulfillments.length === 0 && (
          <div className="text-xs text-text-secondary">No fulfillments yet.</div>
        )}

        {fulfillments.map((f) => (
          <div key={f.id} className="border border-border-default rounded-md p-3">
            <div className="font-medium">
              {f.carrier || "Unknown carrier"} — {f.tracking || "No tracking"}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              Status: {f.status}
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED"].map(
                (s) => (
                  <button
                    key={s}
                    className="btn btn-outline btn-sm"
                    onClick={() => updateStatus(f.id, s)}
                    disabled={isPending}
                  >
                    Mark {s.replace(/_/g, " ").toLowerCase()}
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
