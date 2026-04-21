import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

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
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl font-semibold flex items-center gap-3 text-text">
          Security Event
          <SeverityBadge severity={event.severity} />
        </h1>

        <p className="text-sm text-text-muted">
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
              className="text-primary hover:underline"
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
        <pre className="bg-surface-muted p-4 rounded-md text-sm text-text overflow-x-auto border border-border">
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

/* -------------------------------------------------- */
/* Detail Row                                          */
/* -------------------------------------------------- */

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
      <span className="text-text-muted">{label}</span>
      <span className="text-text">{children ?? value}</span>
    </div>
  );
}

/* -------------------------------------------------- */
/* Section Wrapper                                     */
/* -------------------------------------------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium text-text">{title}</h2>

      <div className="rounded-md border border-border bg-surface-card p-4 space-y-4 shadow-sm">
        {children}
      </div>
    </section>
  );
}

/* -------------------------------------------------- */
/* Related Events Block                                */
/* -------------------------------------------------- */

function RelatedBlock({
  title,
  events,
}: {
  title: string;
  events: Array<{ id: string; type: string; timestamp: Date | string }>;
}) {
  return (
    <div className="space-y-1">
      <h3 className="font-medium text-text">{title}</h3>

      {events.length === 0 ? (
        <p className="text-sm text-text-muted">No related events.</p>
      ) : (
        <ul className="space-y-1">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={`/admin/security/events/${e.id}`}
                className="text-primary hover:underline text-sm"
              >
                {e.type} — {new Date(e.timestamp).toLocaleString()}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* Severity Badge                                      */
/* -------------------------------------------------- */

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    low: "bg-success/15 text-success border-success/30",
    medium: "bg-warning/15 text-warning border-warning/30",
    high: "bg-danger/15 text-danger border-danger/30",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[severity.toLowerCase()] ?? styles.low
      )}
    >
      {severity}
    </span>
  );
}
