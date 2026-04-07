import { AdminTable } from "@/components/admin/ui/AdminTable";

export default async function SecurityDevicesPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/security/devices`, {
    cache: "no-store",
  });

  const { devices } = await res.json();

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
          d.userId,
          d.device,
          d.ip,
          new Date(d.lastSeen).toLocaleString(),
        ])}
      />
    </div>
  );
}
