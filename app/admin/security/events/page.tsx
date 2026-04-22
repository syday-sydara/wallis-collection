"use client";

import { useState, useEffect } from "react";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import EventTable from "@/components/security/EventTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

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

type EventsResponse = {
  events: SecurityEvent[];
  nextCursor: string | null;
  hasNextPage: boolean;
  limit: number;
};

export default function SecurityEventsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [type, setType] = useState("");
  const [severity, setSeverity] = useState("");
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchEvents = async (cursor?: string, append = false) => {
    setLoading(!append);
    setLoadingMore(append);

    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (type) params.set("type", type);
    if (severity) params.set("severity", severity);
    if (userId) params.set("userId", userId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const res = await fetch(`/api/security/events?${params}`);
    const data: EventsResponse = await res.json();

    if (append) {
      setEvents(prev => [...prev, ...data.events]);
    } else {
      setEvents(data.events);
    }

    setNextCursor(data.nextCursor);
    setHasNextPage(data.hasNextPage);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [type, severity, userId, from, to]);

  const loadMore = () => {
    if (nextCursor) {
      fetchEvents(nextCursor, true);
    }
  };

  const clearFilters = () => {
    setType("");
    setSeverity("");
    setUserId("");
    setFrom("");
    setTo("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Security Events</h1>
          <p className="text-sm text-muted-foreground">
            View and filter security events across the platform
          </p>
        </div>
      </div>

      {/* Filters */}
      <AdminCard header="Filters">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. LOGIN_FAILED"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <Select value={severity} onValueChange={setSeverity}>
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <Input
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <Input
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </AdminCard>

      {/* Events Table */}
      <AdminCard header={`Events (${events.length}${hasNextPage ? '+' : ''})`}>
        {loading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No events found
          </div>
        ) : (
          <>
            <EventTable events={events} />
            {hasNextPage && (
              <div className="mt-4 text-center">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </AdminCard>
    </div>
  );
}
