import { AdminCard } from "@/components/admin/ui/AdminCard";

export default async function RiskDistributionCard() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/security/risk-distribution`, {
    cache: "no-store",
  });

  const data = await res.json();

  return (
    <AdminCard header="Risk Distribution" subtle>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Low</span>
          <span className="font-semibold text-success">{data.low}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-muted">Medium</span>
          <span className="font-semibold text-warning">{data.medium}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-muted">High</span>
          <span className="font-semibold text-danger">{data.high}</span>
        </div>
      </div>
    </AdminCard>
  );
}
