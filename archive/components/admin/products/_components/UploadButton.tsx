"use client";

import { useState } from "react";

export function UploadButton({ productId, onUploaded }) {
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) onUploaded(data);
  }

  return (
    <label className="inline-flex items-center px-4 py-2 bg-black text-white rounded cursor-pointer">
      {loading ? "Uploading..." : "Upload Image"}
      <input type="file" className="hidden" onChange={handleUpload} />
    </label>
  );
}
