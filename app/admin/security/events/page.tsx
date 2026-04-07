// app/admin/security/page.tsx
export const dynamic = "force-dynamic";

import { requirePermission } from "@/lib/auth/require-admin";
import { PERMISSIONS } from "@/lib/auth/permissions";
import SecuritySummaryCards from "@/app/admin/security/ui/SecuritySummaryCards";
import RecentSecurityEvents from "@/app/admin/security/ui/RecentSecurityEvents";
import RiskDistributionCard from "@/app/admin/security/ui/RiskDistributionCard";
import ActiveSessionsCard from "@/app/admin/security/ui/ActiveSessionsCard";
import DevicesSnapshotCard from "@/app/admin/security/ui/DevicesSnapshotCard";

export default async function AdminSecurityDashboard() {
  await requirePermission(PERMISSIONS.VIEW_SECURITY_CENTER);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-text">
          Security Dashboard
        </h1>
        <p className="text-sm text-text-muted">
          High‑level overview of system security, risk posture, and active threats.
        </p>
      </header>

      {/* Summary Cards */}
      <SecuritySummaryCards />

      {/* Grid: Risk + Sessions + Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RiskDistributionCard />
        <ActiveSessionsCard />
        <DevicesSnapshotCard />
      </div>

      {/* Recent Events */}
      <RecentSecurityEvents />
    </div>
  );
}
