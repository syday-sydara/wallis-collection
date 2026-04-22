import { AdminCard } from "@/components/admin/ui/AdminCard";

async function fetchSessions() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/security/sessions`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return { sessions: [], new24h: 0, trend: 0 };
  }

  return res.json();
}

export default async function ActiveSessionsCard() {
  const { sessions, new24h, trend } = await fetchSessions();

  return (
    <AdminCard header="Active Sessions" subtle>
      <div className="space-y-1">
        <p className="text-3xl font-semibold">{sessions.length}</p>
        <p className="text-xs text-text-muted">Across all users</p>

        {/* Optional: new sessions in last 24h */}
        {typeof new24h === "number" && (
          <p className="text-xs text-text-muted">
            {new24h} new in the last 24h
          </p>
        )}

        {/* Optional: trend indicator */}
        {typeof trend === "number" && (
          <p
            className={
              trend >= 0
                ? "text-xs text-success"
                : "text-xs text-danger"
            }
          >
            {trend >= 0 ? "+" : ""}
            {trend}% from last week
          </p>
        )}
      </div>
    </AdminCard>
  );
}
