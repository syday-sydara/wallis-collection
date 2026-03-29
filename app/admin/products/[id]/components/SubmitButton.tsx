"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel,
  className
}: {
  children: string;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "rounded bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
      }
    >
      {pending ? pendingLabel ?? "Saving..." : children}
    </button>
  );
}