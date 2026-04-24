"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import EventTable from "@/components/security/EventTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
 from "@/components/ui/Select";

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

  // Debounce text filters (type, userId)
  const [debouncedType, setDebouncedType] = useState(type);
  const [debouncedUserId, setDebouncedUserId] = useState(userId);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedType(type), 300);
    return () => clearTimeout(t);
  }, [type]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedUserId(userId), 300);
    return () => clearTimeout(t);
  }, [userId]);

  const fetchEvents = useCallback(
    async (cursor?: string, append = false) => {
      if (!append) setLoading(true);
      if (append) setLoadingMore(true);

      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      if (debouncedType) params.set("type", debouncedType);
      if (severity) params.set("severity", severity);
      if (debouncedUserId) params.set("userId", debouncedUserId);
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const res = await fetch(`/api/security/events?${params}`);
      const data: EventsResponse = await res.json();

      setEvents(prev => (append ? [...prev, ...data.events] : data.events));
      setNextCursor(data.nextCursor);
      setHasNextPage(data.hasNextPage);

      setLoading(false);
      setLoadingMore(false);
    },
    [debouncedType, severity, debouncedUserId, from, to]
  );

  // Fetch on filter change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const loadMore = () => {
    if (nextCursor) fetchEvents(nextCursor, true);
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
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Security Events</h1>
        <p className="text-sm text-muted-foreground">
          View and filter security events across the platform
        </p>
      </div>

      {/* Filters */}
      <AdminCard header="Filters">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. LOGIN_FAILED"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User ID */}
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID"
            />
          </div>

          {/* From */}
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <Input
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          {/* To */}
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
      <AdminCard header={`Events (${events.length}${hasNextPage ? "+" : ""})`}>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading events…
          </div>
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
                  {loadingMore ? "Loading…" : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </AdminCard>
    </div>
  );
}
