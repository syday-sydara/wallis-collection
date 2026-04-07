import { Card } from "@/components/admin/ui/AdminCard";

async function fetchSecurityMetrics() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/security/metrics`, {
    cache: "no-store",
  });

  if (!res.ok) return { totalEvents: 0, totalUsers: 0, alerts: 0 };
  return res.json();
}

export default async function SecurityOverviewPage() {
  const data = await fetchSecurityMetrics();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">Overview</h2>

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
    </div>
  );
}
