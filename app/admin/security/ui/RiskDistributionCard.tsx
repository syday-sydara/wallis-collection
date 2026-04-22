import { AdminCard } from "@/components/admin/ui/AdminCard";

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
      trend: { low: 0, medium: 0, high: 0 },
    };
  }

  return res.json();
}

export default async function RiskDistributionCard() {
  const data = await fetchRiskDistribution();

  return (
    <AdminCard header="Risk Distribution" subtle>
      <div className="space-y-4">
        {/* Low */}
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Low</span>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-success">{data.low}</span>
            {data.trend?.low !== undefined && (
              <span
                className={
                  data.trend.low >= 0
                    ? "text-xs text-success"
                    : "text-xs text-danger"
                }
              >
                {data.trend.low >= 0 ? "+" : ""}
                {data.trend.low}%
              </span>
            )}
          </div>
        </div>

        {/* Medium */}
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Medium</span>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-warning">{data.medium}</span>
            {data.trend?.medium !== undefined && (
              <span
                className={
                  data.trend.medium >= 0
                    ? "text-xs text-warning"
                    : "text-xs text-danger"
                }
              >
                {data.trend.medium >= 0 ? "+" : ""}
                {data.trend.medium}%
              </span>
            )}
          </div>
        </div>

        {/* High */}
        <div className="flex items-center justify-between">
          <span className="text-text-muted">High</span>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-danger">{data.high}</span>
            {data.trend?.high !== undefined && (
              <span
                className={
                  data.trend.high >= 0
                    ? "text-xs text-danger"
                    : "text-xs text-success"
                }
              >
                {data.trend.high >= 0 ? "+" : ""}
                {data.trend.high}%
              </span>
            )}
          </div>
        </div>
      </div>
    </AdminCard>
  );
}
