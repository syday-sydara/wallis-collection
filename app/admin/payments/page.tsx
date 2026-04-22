import { prisma } from "@/lib/prisma";
import PaymentFilters from "@/components/admin/payments/PaymentFilters";
import PaymentTable from "@/components/admin/payments/PaymentTable";

type SearchParams = {
  status?: string;
  provider?: string;
  q?: string;
  minScore?: string;
  maxScore?: string;
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status, provider, q, minScore, maxScore } = searchParams;

  const where: any = {};

  // Status filter
  if (status && status !== "ALL") {
    where.status = status;
  }

  // Provider filter
  if (provider && provider !== "ALL") {
    where.provider = provider;
  }

  // Fraud score range
  if (minScore || maxScore) {
    where.fraudScore = {};
    if (minScore) where.fraudScore.gte = Number(minScore);
    if (maxScore) where.fraudScore.lte = Number(maxScore);
  }

  // Search filter
  if (q) {
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { orderId: { contains: q } },
      { customerEmail: { contains: q, mode: "insensitive" } },
      { customerPhone: { contains: q, mode: "insensitive" } },
    ];
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      order: true,
    },
    take: 100,
  });

  const hasResults = payments.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-text-muted">
          View and filter all payment activity across the platform.
        </p>
      </div>

      {/* Filters */}
      <PaymentFilters
        initialStatus={status}
        initialProvider={provider}
        initialQuery={q}
        initialMinScore={minScore}
        initialMaxScore={maxScore}
      />

      {/* Results */}
      {hasResults ? (
        <PaymentTable payments={payments} />
      ) : (
        <div className="rounded-lg border border-border bg-surface-card p-10 text-center space-y-3">
          <p className="text-lg font-medium">No payments found</p>
          <p className="text-text-muted text-sm">
            Try adjusting your filters or search query.
          </p>
        </div>
      )}
    </div>
  );
}
