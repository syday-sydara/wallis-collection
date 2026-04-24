"use client";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function ProductTrendGraph({ trend }) {
  if (!trend || trend.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface-card p-6 text-center">
        <p className="text-text-muted">No trend data available.</p>
      </div>
    );
  }

  const labels = trend.map((t) => t.date);

  const data = {
    labels,
    datasets: [
      {
        label: "Views",
        data: trend.map((t) => t.views),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.3,
      },
      {
        label: "Add to Cart",
        data: trend.map((t) => t.addToCart),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.3,
      },
      {
        label: "WhatsApp Clicks",
        data: trend.map((t) => t.whatsapp),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.3,
      },
      {
        label: "Checkout Clicks",
        data: trend.map((t) => t.checkout),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        tension: 0.3,
      },
      {
        label: "Purchases",
        data: trend.map((t) => t.purchases),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="rounded-lg border border-border bg-surface-card p-6 h-[320px]">
      <h2 className="text-lg font-semibold mb-4">Trend Over Time</h2>
      <Line data={data} options={options} />
    </div>
  );
}
