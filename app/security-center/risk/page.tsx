import { Card } from "@/components/admin/ui/AdminCard";

export default async function SecurityRiskPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/security/risk-distribution`, {
    cache: "no-store",
  });

  const data = await res.json();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">Risk Overview</h2>

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
    </div>
  );
}
