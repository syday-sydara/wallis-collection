import clsx from "clsx";

export function Card({ className = "", ...props }) {
  return (
    <div
      className={clsx(
        "bg-bg rounded-lg border border-border shadow-sm p-4",
        className
      )}
      {...props}
    />
  );
}

