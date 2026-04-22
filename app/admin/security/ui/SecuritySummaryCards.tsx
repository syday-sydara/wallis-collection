import { AdminCard } from "@/components/admin/ui/AdminCard";

async function fetchSummary() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/security/metrics`, {
    cache: "no-store",
  });

  if (!res.ok) return { totalEvents: 0, totalUsers: 0, alerts: 0 };
  return res.json();
}

export default async function SecuritySummaryCards() {
  const data = await fetchSummary();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <AdminCard header="Security Events">
        <p className="text-3xl font-semibold">{data.totalEvents}</p>
      </AdminCard>

      <AdminCard header="Users Involved">
        <p className="text-3xl font-semibold">{data.totalUsers}</p>
      </AdminCard>

      <AdminCard header="Alerts (24h)" danger>
        <p className="text-3xl font-semibold text-danger">{data.alerts}</p>
      </AdminCard>
    </div>
  );
}
