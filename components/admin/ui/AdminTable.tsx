// components/admin/ui/AdminTable.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface Column {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
}

interface AdminTableProps {
  columns: Column[];
  rows: ReactNode[][];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function AdminTable({
  columns,
  rows,
  loading = false,
  emptyMessage = "No data to display",
  className,
}: AdminTableProps) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-md border border-border bg-surface-card shadow-sm transition-fast",
        className
      )}
    >
      <table className="w-full text-sm">
        {/* Header */}
        <thead className="bg-surface-muted border-b border-border text-xs uppercase text-text-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "px-4 py-2 font-medium",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center"
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-border">
          {/* Loading */}
          {loading && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-xs text-text-muted"
              >
                Loading…
              </td>
            </tr>
          )}

          {/* Empty */}
          {!loading && rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-xs text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {/* Rows */}
          {!loading &&
            rows.length > 0 &&
            rows.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-surface-muted/60 transition-fast"
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={clsx(
                      "px-4 py-2 align-middle",
                      columns[j]?.align === "right" && "text-right",
                      columns[j]?.align === "center" && "text-center"
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
