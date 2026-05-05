import clsx from "clsx";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={clsx(
        "w-full px-3 py-2 rounded-md border border-border bg-bg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-brand focus:border-brand",
        className
      )}
      {...props}
    />
  );
}

