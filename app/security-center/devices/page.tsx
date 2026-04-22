import { AdminTable } from "@/components/admin/ui/AdminTable";
import Link from "next/link";

async function fetchDevices() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/security/devices`,
    { cache: "no-store" }
  );

  if (!res.ok) return { devices: [] };
  return res.json();
}

export default async function SecurityDevicesPage() {
  const { devices } = await fetchDevices();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">Devices</h2>

      <AdminTable
        columns={[
          { key: "user", label: "User" },
          { key: "device", label: "Device" },
          { key: "ip", label: "IP" },
          { key: "lastSeen", label: "Last Seen" },
        ]}
        rows={devices.map((d) => [
          d.userId ? (
            <Link
              href={`/admin/users/${d.userId}`}
              className="text-blue-600 hover:underline"
            >
              {d.userId}
            </Link>
          ) : (
            "—"
          ),

          d.device ? (
            <span className="text-sm text-text-muted">{d.device}</span>
          ) : (
            "—"
          ),

          d.ip ? (
            <span className="px-2 py-0.5 rounded bg-muted text-xs font-mono">
              {d.ip}
            </span>
          ) : (
            "—"
          ),

          <span className="text-sm">
            {new Date(d.lastSeen).toLocaleString()}
          </span>,
        ])}
      />
    </div>
  );
}
