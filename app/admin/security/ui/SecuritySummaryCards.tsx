import { AdminCard } from "@/components/admin/ui/AdminCard";

async function fetchSummary() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/security/metrics`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return {
      totalEvents: 0,
      totalUsers: 0,
      alerts: 0,
      trend: { events: 0, users: 0, alerts: 0 },
    };
  }

  return res.json();
}

export default async function SecuritySummaryCards() {
  const data = await fetchSummary();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <AdminCard header="Security Events">
        <div className="flex items-end justify-between">
          <p className="text-3xl font-semibold">{data.totalEvents}</p>
          {data.trend?.events !== undefined && (
            <span
              className={
                data.trend.events >= 0
                  ? "text-xs text-success"
                  : "text-xs text-danger"
              }
            >
              {data.trend.events >= 0 ? "+" : ""}
              {data.trend.events}%
            </span>
          )}
        </div>
      </AdminCard>

      <AdminCard header="Users Involved">
        <div className="flex items-end justify-between">
          <p className="text-3xl font-semibold">{data.totalUsers}</p>
          {data.trend?.users !== undefined && (
            <span
              className={
                data.trend.users >= 0
                  ? "text-xs text-success"
                  : "text-xs text-danger"
              }
            >
              {data.trend.users >= 0 ? "+" : ""}
              {data.trend.users}%
            </span>
          )}
        </div>
      </AdminCard>

      <AdminCard header="Alerts (24h)" danger>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-semibold text-danger">{data.alerts}</p>
          {data.trend?.alerts !== undefined && (
            <span
              className={
                data.trend.alerts >= 0
                  ? "text-xs text-danger"
                  : "text-xs text-success"
              }
            >
              {data.trend.alerts >= 0 ? "+" : ""}
              {data.trend.alerts}%
            </span>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
