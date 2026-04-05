// app/security-center/logs/page.tsx
import { prisma } from "@/lib/db";
import EventTable from "@/components/security/EventTable";
import { Suspense } from "react";
import { redirect } from "next/navigation";

// TODO: Replace with your real auth check
async function requireAdmin() {
  const isAdmin = true; // Replace with session/role check
  if (!isAdmin) redirect("/login");
}

export default async function SecurityEventsPage({
  searchParams,
}: {
  searchParams?: {
    severity?: string;
    type?: string;
    requestId?: string;
    ip?: string;
    userId?: string;
    page?: string;
  };
}) {
  await requireAdmin();

  const page = Math.max(Number(searchParams?.page ?? 1), 1);
  const pageSize = 50;
  const skip = (page - 1) * pageSize;

  const where: Record<string, any> = {};
  if (searchParams?.severity) where.severity = searchParams.severity;
  if (searchParams?.type) where.type = searchParams.type;
  if (searchParams?.requestId) where.requestId = searchParams.requestId;
  if (searchParams?.ip) where.ip = searchParams.ip;
  if (searchParams?.userId) where.userId = searchParams.userId;

  const [events, total] = await Promise.all([
    prisma.securityEvent.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.securityEvent.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-8 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Security Events
          </h1>
          <p className="text-sm text-muted-foreground">
            Showing {events.length} of {total} events
          </p>
        </div>
      </header>

      <Suspense fallback={<div>Loading events…</div>}>
        <EventTable events={events} />
      </Suspense>

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <PageButton href={`?page=${page - 1}`} disabled={page <= 1}>
        Previous
      </PageButton>

      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      <PageButton href={`?page=${page + 1}`} disabled={page >= totalPages}>
        Next
      </PageButton>
    </div>
  );
}

function PageButton({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground opacity-50">
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition"
    >
      {children}
    </a>
  );
}