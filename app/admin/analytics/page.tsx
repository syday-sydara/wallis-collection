// app/admin/analytics/page.tsx

import { prisma } from "@/lib/prisma";
import SalesAnalytics from "@/components/admin/analytics/SalesAnalytics";

export const revalidate = 0; // Always fresh in admin

export default async function AnalyticsPage() {
  const [
    totalRevenueAgg,
    totalOrders,
    refundedAgg,
    chargebackAgg,
    dailyRevenue,
    topProducts,
    topCustomers,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
    }),

    prisma.order.count(),

    prisma.payment.aggregate({
      where: { status: "REFUNDED" },
      _sum: { amount: true },
    }),

    prisma.payment.aggregate({
      where: { status: "CHARGEBACK" },
      _sum: { amount: true },
    }),

    prisma.$queryRaw<
      { date: string; revenue: number }[]
    >`
      SELECT DATE("createdAt") AS date, SUM("total") AS revenue
      FROM "Order"
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 30
    `,

    prisma.$queryRaw<
      { name: string; qty: number }[]
    >`
      SELECT p.name, SUM(oi.quantity) AS qty
      FROM "OrderItem" oi
      JOIN "ProductVariant" v ON oi."variantId" = v.id
      JOIN "Product" p ON v."productId" = p.id
      GROUP BY p.name
      ORDER BY qty DESC
      LIMIT 5
    `,

    prisma.$queryRaw<
      { fullName: string | null; spent: number }[]
    >`
      SELECT u."fullName", SUM(o.total) AS spent
      FROM "Order" o
      JOIN "User" u ON o."userId" = u.id
      GROUP BY u."fullName"
      ORDER BY spent DESC
      LIMIT 5
    `,
  ]);

  return (
    <SalesAnalytics
      totalRevenue={totalRevenueAgg._sum.total || 0}
      totalOrders={totalOrders}
      refundedAmount={refundedAgg._sum.amount || 0}
      chargebackAmount={chargebackAgg._sum.amount || 0}
      dailyRevenue={dailyRevenue}
      topProducts={topProducts}
      topCustomers={topCustomers}
    />
  );
}
