// components/admin/ui/AdminCheckbox.tsx
import { InputHTMLAttributes } from "react";

export function AdminCheckbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...props}
      className={
        "h-4 w-4 rounded border-border text-primary focus:ring-[rgb(var(--focus-ring))] " +
        (props.className ?? "")
      }
    />
  );
}