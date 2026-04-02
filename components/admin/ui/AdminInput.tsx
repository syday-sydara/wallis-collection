// components/admin/ui/AdminInput.tsx
import { InputHTMLAttributes } from "react";

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-md border border-border bg-surface px-2 py-1.5 text-text " +
        "shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))] " +
        "disabled:opacity-60 " +
        (props.className ?? "")
      }
    />
  );
}