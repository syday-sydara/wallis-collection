import { Card } from "@/components/admin/ui/AdminCard";

async function fetchSecurityMetrics() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/security/metrics`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return {
      totalEvents: 0,
      totalUsers: 0,
      alerts: 0,
      severity: { low: 0, medium: 0, high: 0 },
      categories: {},
      recent: [],
    };
  }

  return res.json();
}

export default async function SecurityOverviewPage() {
  const data = await fetchSecurityMetrics();

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold tracking-tight">Overview</h2>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card header="Security Events">
          <p className="text-3xl font-semibold">{data.totalEvents}</p>
        </Card>

        <Card header="Users">
          <p className="text-3xl font-semibold">{data.totalUsers}</p>
        </Card>

        <Card header="Alerts (24h)">
          <p className="text-3xl font-semibold text-danger">{data.alerts}</p>
        </Card>
      </div>

      {/* Severity Breakdown */}
      <div>
        <h3 className="text-lg font-medium mb-3">Severity Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card header="High">
            <p className="text-2xl font-semibold text-red-600">
              {data.severity?.high ?? 0}
            </p>
          </Card>
          <Card header="Medium">
            <p className="text-2xl font-semibold text-yellow-600">
              {data.severity?.medium ?? 0}
            </p>
          </Card>
          <Card header="Low">
            <p className="text-2xl font-semibold text-green-600">
              {data.severity?.low ?? 0}
            </p>
          </Card>
        </div>
      </div>

      {/* Recent Events */}
      <div>
        <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
        <Card>
          <ul className="divide-y divide-border">
            {data.recent?.length ? (
              data.recent.map((e: any) => (
                <li key={e.id} className="py-3 text-sm">
                  <span className="font-medium">{e.type}</span>{" "}
                  <span className="text-text-muted">— {e.message}</span>
                </li>
              ))
            ) : (
              <p className="text-text-muted text-sm py-3">No recent events</p>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
