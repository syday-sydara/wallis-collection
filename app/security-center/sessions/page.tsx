import { AdminTable } from "@/components/admin/ui/AdminTable";

export default async function SecuritySessionsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/security/sessions`, {
    cache: "no-store",
  });

  const { sessions } = await res.json();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">Active Sessions</h2>

      <AdminTable
        columns={[
          { key: "user", label: "User" },
          { key: "ip", label: "IP" },
          { key: "device", label: "Device" },
          { key: "lastActive", label: "Last Active" },
        ]}
        rows={sessions.map((s) => [
          s.userId,
          s.ip,
          s.device,
          new Date(s.lastActive).toLocaleString(),
        ])}
      />
    </div>
  );
}
