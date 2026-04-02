type Movement = {
  id: string;
  change: number;
  reason: string;
  createdAt: Date;
};

export function RecentMovements({ movements }: { movements: Movement[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-text tracking-tight">
        Recent movements
      </h3>

      <ul className="mt-2 space-y-1.5 text-xs">
        {movements.map((m) => {
          const isPositive = m.change > 0;

          return (
            <li
              key={m.id}
              className="flex justify-between rounded-md bg-surface-muted/40 px-2 py-1"
            >
              <span className="flex items-center gap-1 text-text">
                <span
                  className={
                    isPositive
                      ? "text-success-foreground font-semibold"
                      : "text-danger-foreground font-semibold"
                  }
                >
                  {isPositive ? `+${m.change}` : m.change}
                </span>
                <span className="text-text-muted">· {m.reason}</span>
              </span>

              <span className="text-[11px] text-text-muted">
                {new Date(m.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                })}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}