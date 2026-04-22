import { AdminTable } from "@/components/admin/ui/AdminTable";
import Link from "next/link";

async function fetchSessions() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/security/sessions`,
    { cache: "no-store" }
  );

  if (!res.ok) return { sessions: [] };
  return res.json();
}

export default async function SecuritySessionsPage() {
  const { sessions } = await fetchSessions();

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
          s.userId ? (
            <Link
              href={`/admin/users/${s.userId}`}
              className="text-blue-600 hover:underline"
            >
              {s.userId}
            </Link>
          ) : (
            "—"
          ),

          s.ip ? (
            <span className="px-2 py-0.5 rounded bg-muted text-xs font-mono">
              {s.ip}
            </span>
          ) : (
            "—"
          ),

          s.device ? (
            <span className="text-sm text-text-muted">{s.device}</span>
          ) : (
            "—"
          ),

          <span className="text-sm">
            {new Date(s.lastActive).toLocaleString()}
          </span>,
        ])}
      />
    </div>
  );
}
