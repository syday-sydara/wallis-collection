"use client";

import { useState } from "react";

export function ReplaceImageModal({ productId, image, onClose, onReplaced }) {
  const [loading, setLoading] = useState(false);

  if (!image) return null;

  async function handleReplace(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(
      `/api/admin/products/${productId}/images/${image.id}/replace`,
      {
        method: "POST",
        body: form,
      }
    );

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      onReplaced(data);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md space-y-4">
        <h2 className="text-lg font-semibold">Replace Image</h2>

        <label className="inline-flex items-center px-4 py-2 bg-black text-white rounded cursor-pointer">
          {loading ? "Replacing..." : "Choose New Image"}
          <input type="file" className="hidden" onChange={handleReplace} />
        </label>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
