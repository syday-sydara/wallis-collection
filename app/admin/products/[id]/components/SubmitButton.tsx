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

  const baseClasses =
    "rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm " +
    "hover:bg-primary-hover active:bg-primary-active disabled:opacity-60 transition-all";

  return (
    <button
      type="submit"
      disabled={pending}
      className={className ? className : baseClasses}
    >
      {pending ? pendingLabel ?? "Saving..." : children}
    </button>
  );
}