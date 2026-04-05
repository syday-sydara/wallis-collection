import { AdminCard } from "@/components/admin/ui/AdminCard";

export function RecentMovements({ movements }) {
  if (!movements || movements.length === 0) {
    return <p className="text-xs text-text-muted">No recent movements.</p>;
  }

  return (
    <div className="space-y-3">
      {movements.map((m) => (
        <AdminCard key={m.id}>
          <div className="flex justify-between items-center">
            <span className="font-medium">{m.reason}</span>

            <span
              role="text"
              aria-label={`Stock change: ${m.change}`}
              className={`font-mono px-2 py-0.5 rounded text-xs ${
                m.change > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {m.change > 0 ? "+" : ""}
              {m.change}
            </span>
          </div>

          <p className="text-xs text-text-muted mt-1">
            {new Date(m.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </AdminCard>
      ))}
    </div>
  );
}