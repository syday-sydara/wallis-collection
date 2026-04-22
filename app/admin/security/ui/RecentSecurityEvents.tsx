import { AdminCard } from "@/components/admin/ui/AdminCard";
import Link from "next/link";

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
          <Link
            key={e.id}
            href={`/security-center/logs/${e.id}`}
            className="block py-3 px-1 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{e.type}</p>
                <p className="text-xs text-text-muted">
                  {new Date(e.timestamp).toLocaleString()}
                </p>
              </div>

              <SeverityBadge severity={e.severity} />
            </div>
          </Link>
        ))}

        {events.length === 0 && (
          <p className="text-text-muted text-sm py-4">No recent events</p>
        )}
      </div>
    </AdminCard>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    high: "text-danger bg-danger/10 border-danger/20",
    medium: "text-warning bg-warning/10 border-warning/20",
    low: "text-success bg-success/10 border-success/20",
  };

  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded border capitalize ${
        styles[severity] ?? "text-text-muted bg-muted border-border"
      }`}
    >
      {severity}
    </span>
  );
}
