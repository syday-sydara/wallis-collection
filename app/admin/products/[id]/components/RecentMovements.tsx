import { AdminCard } from "@/components/admin/ui/AdminCard";

export function RecentMovements({ movements }) {
  if (!movements || movements.length === 0) {
    return <p className="text-xs text-text-muted">No recent movements.</p>;
  }

  return (
    <div className="space-y-3">
      {movements.map((m) => (
        <AdminCard key={m.id}>
          <div className="flex justify-between">
            <span className="font-medium">{m.reason}</span>
            <span
              className={
                m.change > 0 ? "text-green-600" : "text-red-600"
              }
            >
              {m.change > 0 ? "+" : ""}
              {m.change}
            </span>
          </div>

          <p className="text-xs text-text-muted mt-1">
            {new Date(m.createdAt).toLocaleString()}
          </p>
        </AdminCard>
      ))}
    </div>
  );
}