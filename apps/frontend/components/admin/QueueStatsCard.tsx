import clsx from "clsx";

export function QueueStatsCard({ className = "", ...props }) {
  return (
    <div className={clsx("rounded border border-gray-200 p-3 bg-white", className)} {...props}>
      <span className="text-gray-400 text-sm">QueueStatsCard component</span>
    </div>
  );
}
