type Movement = {
  id: string;
  change: number;
  reason: string;
  createdAt: Date;
};

export function RecentMovements({ movements }: { movements: Movement[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">Recent movements</h3>
      <ul className="mt-2 space-y-1 text-xs text-neutral-700">
        {movements.map((m) => (
          <li key={m.id} className="flex justify-between">
            <span>
              {m.change > 0 ? "+" : ""}
              {m.change} · {m.reason}
            </span>
            <span className="text-[11px] text-neutral-500">
              {new Date(m.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}