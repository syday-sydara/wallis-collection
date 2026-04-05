"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import Link from "next/link";

type SecurityEvent = {
  id: string;
  timestamp: string | Date;
  type: string;
  message: string;
  severity: "low" | "medium" | "high";
  userId: string | null;
  ip: string | null;
  requestId?: string | null;
};

export default function EventTable({ events }: { events: SecurityEvent[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Request</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {events.map((e) => (
            <TableRow
              key={e.id}
              onMouseEnter={() => setHovered(e.id)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "cursor-pointer transition-colors",
                hovered === e.id && "bg-muted/40"
              )}
            >
              <TableCell className="whitespace-nowrap text-sm">
                {new Date(e.timestamp).toLocaleString()}
              </TableCell>

              <TableCell>
                <SeverityBadge severity={e.severity} />
              </TableCell>

              <TableCell>{e.type}</TableCell>

              <TableCell className="max-w-[260px] truncate">
                {e.message}
              </TableCell>

              <TableCell>{e.ip ?? "—"}</TableCell>

              <TableCell>
                {e.userId ? (
                  <Link
                    href={`/admin/users/${e.userId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {e.userId}
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>

              <TableCell>
                {e.requestId ? (
                  <Link
                    href={`/admin/security/events?requestId=${e.requestId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {e.requestId.slice(0, 8)}…
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" }) {
  const colors = {
    low: "bg-green-600/20 text-green-700 border-green-600/30",
    medium: "bg-yellow-600/20 text-yellow-700 border-yellow-600/30",
    high: "bg-red-600/20 text-red-700 border-red-600/30"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        colors[severity]
      )}
    >
      {severity}
    </span>
  );
}