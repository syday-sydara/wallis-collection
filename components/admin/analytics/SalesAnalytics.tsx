"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Package,
  CreditCard,
  RefreshCcw,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

export default function SalesAnalytics({
  totalRevenue,
  totalOrders,
  refundedAmount,
  chargebackAmount,
  dailyRevenue,
  topProducts,
  topCustomers,
}: {
  totalRevenue: number;
  totalOrders: number;
  refundedAmount: number;
  chargebackAmount: number;
  dailyRevenue: Array<{ date: string; revenue: number }>;
  topProducts: Array<{ name: string; qty: number }>;
  topCustomers: Array<{ fullName: string | null; spent: number }>;
}) {
  const revenueData = dailyRevenue
    .slice()
    .reverse()
    .map((d) => d.revenue);

  const labels = dailyRevenue
    .slice()
    .reverse()
    .map((d) => new Date(d.date).toLocaleDateString("en-US"));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: revenueData,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.15)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const last = revenueData[revenueData.length - 1] || 0;
  const prev = revenueData[revenueData.length - 2] || 0;
  const trend = last - prev;
  const trendUp = trend >= 0;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-text-muted">
          Key performance metrics for your store.
        </p>
      </div>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI
          title="Total Revenue"
          value={`₦${(totalRevenue / 100).toLocaleString("en-NG")}`}
          icon={CreditCard}
          trend={trend}
        />

        <KPI
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={Package}
        />

        <KPI
          title="Refunded"
          value={`₦${(refundedAmount / 100).toLocaleString("en-NG")}`}
          icon={RefreshCcw}
        />

        <KPI
          title="Chargebacks"
          value={`₦${(chargebackAmount / 100).toLocaleString("en-NG")}`}
          icon={RefreshCcw}
        />
      </section>

      {/* Revenue Chart */}
      <section className="rounded-lg border border-border bg-surface-card p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Revenue (Last 30 Days)</h2>
        <Line data={chartData} height={80} />
      </section>

      {/* Top Products + Customers */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top Products">
          <ul className="space-y-3">
            {topProducts.map((p) => (
              <li key={p.name} className="flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="font-medium">{p.qty} sold</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Top Customers">
          <ul className="space-y-3">
            {topCustomers.map((c, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{c.fullName || "Unknown"}</span>
                <span className="font-medium">
                  ₦{(c.spent / 100).toLocaleString("en-NG")}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

/* -------------------------------------------------- */
/* KPI Component                                       */
/* -------------------------------------------------- */

function KPI({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  icon: any;
  trend?: number;
}) {
  const trendUp = trend != null && trend >= 0;

  return (
    <div className="rounded-lg border border-border bg-surface-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{title}</p>
        <Icon className="h-5 w-5 text-text-muted" />
      </div>

      <p className="text-2xl font-semibold">{value}</p>

      {trend != null && (
        <div
          className={`flex items-center gap-1 text-sm ${
            trendUp ? "text-success" : "text-danger"
          }`}
        >
          {trendUp ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {Math.abs(trend).toLocaleString()}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* Card Component                                      */
/* -------------------------------------------------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface-card p-6 shadow-sm">
      <h2 className="text-lg font-medium mb-4">{title}</h2>
      {children}
    </div>
  );
}
