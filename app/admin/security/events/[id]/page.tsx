// app/admin/security/events/[id]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await prisma.securityEvent.findUnique({
    where: { id: params.id },
  });

  if (!event) return notFound();

  // Fetch related events concurrently
  const relatedByRequestId = event.requestId
    ? prisma.securityEvent.findMany({
        where: { requestId: event.requestId, NOT: { id: event.id } },
        orderBy: { timestamp: "desc" },
        take: 10,
      })
    : Promise.resolve([]);

  const relatedByIp = event.ip
    ? prisma.securityEvent.findMany({
        where: { ip: event.ip, NOT: { id: event.id } },
        orderBy: { timestamp: "desc" },
        take: 10,
      })
    : Promise.resolve([]);

  const relatedByUser = event.userId
    ? prisma.securityEvent.findMany({
        where: { userId: event.userId, NOT: { id: event.id } },
        orderBy: { timestamp: "desc" },
        take: 10,
      })
    : Promise.resolve([]);

  const [reqEvents, ipEvents, userEvents] = await Promise.all([
    relatedByRequestId,
    relatedByIp,
    relatedByUser,
  ]);

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          Security Event
          <SeverityBadge severity={event.severity} />
        </h1>

        <p className="text-muted-foreground text-sm">
          {new Date(event.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Event Info */}
      <Section title="Event Details">
        <Detail label="Type" value={event.type} />
        <Detail label="Message" value={event.message} />
        <Detail label="User">
          {event.userId ? (
            <Link
              href={`/admin/users/${event.userId}`}
              className="text-blue-600 hover:underline"
            >
              {event.userId}
            </Link>
          ) : (
            "—"
          )}
        </Detail>
        <Detail label="IP" value={event.ip ?? "—"} />
        <Detail label="User Agent" value={event.userAgent ?? "—"} />
        <Detail label="Request ID" value={event.requestId ?? "—"} />
        <Detail label="Version" value={event.version?.toString() ?? "1"} />
      </Section>

      {/* Metadata */}
      <Section title="Metadata">
        <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
          {JSON.stringify(event.metadata ?? {}, null, 2)}
        </pre>
      </Section>

      {/* Related Events */}
      <Section title="Related Events">
        <RelatedBlock title="Same Request ID" events={reqEvents} />
        <RelatedBlock title="Same IP" events={ipEvents} />
        <RelatedBlock title="Same User" events={userEvents} />
      </Section>
    </div>
  );
}

function Detail({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span>{children ?? value}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="rounded-md border p-4 space-y-4 bg-card">{children}</div>
    </div>
  );
}

function RelatedBlock({
  title,
  events,
}: {
  title: string;
  events: Array<{ id: string; type: string; timestamp: Date | string }>;
}) {
  if (!events || events.length === 0) {
    return (
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">No related events.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium mb-2">{title}</h3>
      <ul className="space-y-1">
        {events.map((e) => (
          <li key={e.id}>
            <Link
              href={`/admin/security/events/${e.id}`}
              className="text-blue-600 hover:underline text-sm"
            >
              {e.type} — {new Date(e.timestamp).toLocaleString()}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    low: "bg-green-600/20 text-green-700 border-green-600/30",
    medium: "bg-yellow-600/20 text-yellow-700 border-yellow-600/30",
    high: "bg-red-600/20 text-red-700 border-red-600/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        colors[severity.toLowerCase()] ?? colors.low
      )}
    >
      {severity}
    </span>
  );
}