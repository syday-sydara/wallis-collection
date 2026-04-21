// components/admin/analytics/SalesAnalytics.tsx

"use client";

import { Line } from "react-chartjs-2";

export default function SalesAnalytics({
  totalRevenue,
  totalOrders,
  refundedAmount,
  chargebackAmount,
  dailyRevenue,
  topProducts,
  topCustomers,
}) {
  const chartData = {
    labels: dailyRevenue.map((d) => d.date),
    datasets: [
      {
        label: "Revenue",
        data: dailyRevenue.map((d) => Number(d.revenue)),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
      },
    ],
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-xl font-semibold">Sales Analytics</h1>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h2 className="text-sm text-text-secondary">Total Revenue</h2>
          <p className="text-2xl font-semibold">₦{totalRevenue}</p>
        </div>

        <div className="card">
          <h2 className="text-sm text-text-secondary">Orders</h2>
          <p className="text-2xl font-semibold">{totalOrders}</p>
        </div>

        <div className="card">
          <h2 className="text-sm text-text-secondary">Refunded</h2>
          <p className="text-2xl font-semibold text-warning">₦{refundedAmount}</p>
        </div>

        <div className="card">
          <h2 className="text-sm text-text-secondary">Chargebacks</h2>
          <p className="text-2xl font-semibold text-danger">₦{chargebackAmount}</p>
        </div>
      </section>

      {/* Revenue Chart */}
      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-4">Revenue (Last 30 Days)</h2>
        <Line data={chartData} />
      </section>

      {/* Top Products */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Top Products</h2>
        <ul className="space-y-2">
          {topProducts.map((p, i) => (
            <li key={i} className="flex justify-between">
              <span>{p.name}</span>
              <span className="font-medium">{p.qty} sold</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Top Customers */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Top Customers</h2>
        <ul className="space-y-2">
          {topCustomers.map((c, i) => (
            <li key={i} className="flex justify-between">
              <span>{c.fullName}</span>
              <span className="font-medium">₦{c.spent}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
