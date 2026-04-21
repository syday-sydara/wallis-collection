// app/(admin)/analytics/page.tsx

import { prisma } from "@/lib/prisma";
import SalesAnalytics from "@/components/admin/analytics/SalesAnalytics";

export default async function AnalyticsPage() {
  const [
    totalRevenue,
    totalOrders,
    refundedAmount,
    chargebackAmount,
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

    prisma.$queryRaw`
      SELECT DATE("createdAt") AS date, SUM("total") AS revenue
      FROM "Order"
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 30
    `,

    prisma.$queryRaw`
      SELECT p.name, SUM(oi.quantity) AS qty
      FROM "OrderItem" oi
      JOIN "ProductVariant" v ON oi."variantId" = v.id
      JOIN "Product" p ON v."productId" = p.id
      GROUP BY p.name
      ORDER BY qty DESC
      LIMIT 5
    `,

    prisma.$queryRaw`
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
      totalRevenue={totalRevenue._sum.total || 0}
      totalOrders={totalOrders}
      refundedAmount={refundedAmount._sum.amount || 0}
      chargebackAmount={chargebackAmount._sum.amount || 0}
      dailyRevenue={dailyRevenue}
      topProducts={topProducts}
      topCustomers={topCustomers}
    />
  );
}
