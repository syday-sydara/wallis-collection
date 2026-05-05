import clsx from "clsx";

const statusColors = {
  paid: "bg-status-paid/10 text-status-paid",
  pending: "bg-status-pending/10 text-status-pending",
  failed: "bg-status-failed/10 text-status-failed",
  processing: "bg-status-processing/10 text-status-processing",

  instock: "bg-inventory-instock/10 text-inventory-instock",
  low: "bg-inventory-low/10 text-inventory-low",
  out: "bg-inventory-out/10 text-inventory-out",

  active: "bg-queue-active/10 text-queue-active",
  waiting: "bg-queue-waiting/10 text-queue-waiting",
  failedQueue: "bg-queue-failed/10 text-queue-failed",
  delayed: "bg-queue-delayed/10 text-queue-delayed",
};

type Status = keyof typeof statusColors;

export function StatusPill({ status, className = "" }: { status: Status; className?: string }) {
  return (
    <span
      className={clsx(
        "px-2 py-1 text-xs font-medium rounded-full",
        statusColors[status],
        className
      )}
    >
      {status}
    </span>
  );
}

