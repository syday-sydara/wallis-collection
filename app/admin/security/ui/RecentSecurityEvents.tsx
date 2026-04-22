import { AdminCard } from "@/components/admin/ui/AdminCard";

async function fetchRecentEvents() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/security/events?limit=10`,
    { cache: "no-store" }
  );

  if (!res.ok) return { events: [] };
  return res.json();
}

export default async function RecentSecurityEvents() {
  const { events } = await fetchRecentEvents();

  return (
    <AdminCard header="Recent Security Events" elevated>
      <div className="divide-y divide-border">
        {events.map((e) => (
          <div key={e.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{e.type}</p>
              <p className="text-xs text-text-muted">
                {new Date(e.timestamp).toLocaleString()}
              </p>
            </div>

            <span
              className={
                e.severity === "high"
                  ? "text-danger font-semibold"
                  : e.severity === "medium"
                  ? "text-warning font-semibold"
                  : "text-success font-semibold"
              }
            >
              {e.severity}
            </span>
          </div>
        ))}

        {events.length === 0 && (
          <p className="text-text-muted text-sm py-4">No recent events</p>
        )}
      </div>
    </AdminCard>
  );
}
