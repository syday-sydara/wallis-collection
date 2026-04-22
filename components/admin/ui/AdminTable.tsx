"use client";

import { cn } from "@/lib/utils";

type Column = {
  key: string;
  label: string;
};

type AdminTableProps = {
  columns: Column[];
  rows: (string | React.ReactNode)[][];
  className?: string;
};

export function AdminTable({ columns, rows, className }: AdminTableProps) {
  return (
    <div className={cn("rounded-md border bg-card", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-4 align-middle">
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