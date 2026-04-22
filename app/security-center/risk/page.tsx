import { Card } from "@/components/admin/ui/AdminCard";

async function fetchRiskDistribution() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/security/risk-distribution`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return {
      low: 0,
      medium: 0,
      high: 0,
      topUsers: [],
      topIps: [],
      recent: [],
    };
  }

  return res.json();
}

export default async function SecurityRiskPage() {
  const data = await fetchRiskDistribution();

  return (
    <div className="space-y-10">
      <h2 className="text-xl font-semibold tracking-tight">Risk Overview</h2>

      {/* Risk Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card header="Low Risk">
          <p className="text-3xl font-semibold text-success">{data.low}</p>
        </Card>

        <Card header="Medium Risk">
          <p className="text-3xl font-semibold text-warning">{data.medium}</p>
        </Card>

        <Card header="High Risk">
          <p className="text-3xl font-semibold text-danger">{data.high}</p>
        </Card>
      </div>

      {/* Top High-Risk Users */}
      {data.topUsers?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Top High-Risk Users</h3>
          <Card>
            <ul className="divide-y divide-border">
              {data.topUsers.map((u: any) => (
                <li key={u.userId} className="py-3 text-sm flex justify-between">
                  <span className="font-medium">{u.userId}</span>
                  <span className="text-danger font-semibold">{u.riskScore}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Top High-Risk IPs */}
      {data.topIps?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Top High-Risk IPs</h3>
          <Card>
            <ul className="divide-y divide-border">
              {data.topIps.map((ip: any) => (
                <li key={ip.ip} className="py-3 text-sm flex justify-between">
                  <span className="font-mono">{ip.ip}</span>
                  <span className="text-danger font-semibold">{ip.riskScore}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Recent High-Risk Events */}
      {data.recent?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Recent High-Risk Events</h3>
          <Card>
            <ul className="divide-y divide-border">
              {data.recent.map((e: any) => (
                <li key={e.id} className="py-3 text-sm">
                  <span className="font-medium">{e.type}</span>{" "}
                  <span className="text-text-muted">— {e.message}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
