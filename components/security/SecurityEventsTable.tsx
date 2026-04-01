"use client";

import { useEffect, useState } from "react";
import SecurityEventDrawer from "./SecurityEventDrawer";

export default function SecurityEventsTable() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`/api/security/events?page=${page}`)
      .then((res) => res.json())
      .then((data) => setEvents(data.data));
  }, [page]);

  return (
    <div className="border rounded-md bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-3 text-left">Time</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Severity</th>
            <th className="p-3 text-left">User</th>
            <th className="p-3 text-left">IP</th>
            <th className="p-3 text-left">Message</th>
          </tr>
        </thead>

        <tbody>
          {events.map((ev: any) => (
            <tr
              key={ev.id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelected(ev)}
            >
              <td className="p-3">{new Date(ev.createdAt).toLocaleString()}</td>
              <td className="p-3 font-medium">{ev.type}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    ev.severity === "high"
                      ? "bg-red-100 text-red-700"
                      : ev.severity === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {ev.severity}
                </span>
              </td>
              <td className="p-3">{ev.user?.email ?? "Anonymous"}</td>
              <td className="p-3">{ev.ip ?? "-"}</td>
              <td className="p-3">{ev.message}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <SecurityEventDrawer event={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}