import { AdminCard } from "@/components/admin/ui/AdminCard";

export default async function DevicesSnapshotCard() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/security/devices`, {
    cache: "no-store",
  });

  const { devices } = await res.json();

  return (
    <AdminCard header="Known Devices" subtle>
      <p className="text-3xl font-semibold">{devices.length}</p>
      <p className="text-xs text-text-muted mt-1">Tracked devices</p>
    </AdminCard>
  );
}
