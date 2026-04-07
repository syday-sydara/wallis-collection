import { AdminCard } from "@/components/admin/ui/AdminCard";

export default async function ActiveSessionsCard() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/security/sessions`, {
    cache: "no-store",
  });

  const { sessions } = await res.json();

  return (
    <AdminCard header="Active Sessions" subtle>
      <p className="text-3xl font-semibold">{sessions.length}</p>
      <p className="text-xs text-text-muted mt-1">Across all users</p>
    </AdminCard>
  );
}
