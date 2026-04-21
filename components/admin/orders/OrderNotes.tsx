"use client";

import { useState, useTransition } from "react";
import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function OrderNotes({
  orderId,
  notes,
}: {
  orderId: string;
  notes: any[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!message.trim()) return;

    startTransition(async () => {
      try {
        await admin.orders.addNote(orderId, message.trim());
        toast.success("Note added");
        setMessage("");
        router.refresh();
      } catch {
        toast.error("Failed to add note");
      }
    });
  }

  return (
    <div className="border border-border-default rounded-md p-4 space-y-4">
      <h2 className="font-medium text-sm">Notes</h2>

      {/* Add note */}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Add a note..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={isPending}
        >
          Add
        </button>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {notes.length === 0 && (
          <div className="text-sm text-text-secondary">No notes yet.</div>
        )}

        {notes.map((n) => (
          <div key={n.id} className="border border-border-default rounded-md p-3">
            <div className="text-sm">{n.metadata?.message}</div>
            <div className="text-xs text-text-secondary mt-1">
              {format(new Date(n.createdAt), "yyyy-MM-dd HH:mm")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
