"use client";

import { useModal } from "./AdminModalController";

export function AdminModalHeader({ title }: { title: string }) {
  const { close } = useModal();

  return (
    <div className="flex items-center justify-between pb-2 border-b border-border">
      <h2 className="text-lg font-medium">{title}</h2>
      <button
        onClick={close}
        className="text-text-muted hover:text-text transition"
      >
        ✕
      </button>
    </div>
  );
}
