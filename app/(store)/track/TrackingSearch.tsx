"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackingSearch() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function submit() {
    if (!value.trim()) return;
    setLoading(true);
    router.push(`/track/${value.trim()}`);
  }

  return (
    <div className="space-y-3">
      <input
        className="input input-lg"
        placeholder="Enter tracking number or phone number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button
        className={`btn btn-primary w-full ${loading ? "btn-loading" : ""}`}
        onClick={submit}
      >
        Track Order
      </button>

      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}?text=Hello, I want to track my order: ${value}`}
        className="btn w-full"
        style={{ background: "rgb(var(--color-whatsapp))", color: "#fff" }}
      >
        Track via WhatsApp
      </a>
    </div>
  );
}
