import { AdminCard } from "@/components/admin/ui/AdminCard";

async function fetchDevices() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/security/devices`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return { devices: [], newDevices24h: 0, trend: 0 };
  }

  return res.json();
}

export default async function DevicesSnapshotCard() {
  const { devices, newDevices24h, trend } = await fetchDevices();

  return (
    <AdminCard header="Known Devices" subtle>
      <div className="space-y-1">
        <p className="text-3xl font-semibold">{devices.length}</p>
        <p className="text-xs text-text-muted">Tracked devices</p>

        {/* Optional: new devices in last 24h */}
        {typeof newDevices24h === "number" && (
          <p className="text-xs text-text-muted">
            {newDevices24h} new in the last 24h
          </p>
        )}

        {/* Optional: trend indicator */}
        {typeof trend === "number" && (
          <p
            className={
              trend >= 0
                ? "text-xs text-success"
                : "text-xs text-danger"
            }
          >
            {trend >= 0 ? "+" : ""}
            {trend}% from last week
          </p>
        )}
      </div>
    </AdminCard>
  );
}
