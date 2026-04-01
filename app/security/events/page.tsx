import SecurityEventsTable from "@/components/security/SecurityEventsTable";

export default function SecurityEventsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Security Events</h1>
      <SecurityEventsTable />
    </div>
  );
}