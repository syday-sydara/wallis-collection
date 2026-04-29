// lib/analytics-bus.ts

/**
 * Global analytics bus with:
 * - track()
 * - identify()
 * - page()
 * - sampling
 * - metadata sanitization
 * - event queueing
 * - CustomEvent + dataLayer support
 */

type AnalyticsEvent = {
  type: "track" | "identify" | "page";
  name: string;
  data?: Record<string, any>;
  userId?: string | null;
  traits?: Record<string, any>;
  timestamp: string;
  version: number;
  context?: string;
};

type AnalyticsOptions = {
  sampleRate?: number;
  debug?: boolean;
  dataLayer?: boolean;
  fireAndForget?: boolean;
};

const MAX_METADATA_BYTES = 5000;
const EVENT_NAME = "analytics:event";

// Queue events fired before listeners attach
const earlyQueue: CustomEvent[] = [];
let listenersReady = false;

export function markAnalyticsReady() {
  listenersReady = true;
  for (const evt of earlyQueue) {
    window.dispatchEvent(evt);
  }
  earlyQueue.length = 0;
}

function sanitizeMetadata(obj: Record<string, any> = {}) {
  try {
    const json = JSON.stringify(obj);
    if (json.length > MAX_METADATA_BYTES) {
      return { _truncated: true };
    }
    return obj;
  } catch {
    return { _error: "invalid_metadata" };
  }
}

function emit(event: AnalyticsEvent, options: AnalyticsOptions) {
  if (typeof window === "undefined") return;

  const { debug = false, dataLayer = false } = options;

  const customEvent = new CustomEvent(EVENT_NAME, { detail: event });

  try {
    if (listenersReady) {
      window.dispatchEvent(customEvent);
    } else {
      earlyQueue.push(customEvent);
    }
  } catch (err) {
    if (debug) console.error("[analytics] dispatch failed", err);
  }

  // Optional GTM dataLayer push
  if (dataLayer && Array.isArray((window as any).dataLayer)) {
    try {
      (window as any).dataLayer.push({
        event: event.type,
        ...event,
      });
    } catch (err) {
      if (debug) console.error("[analytics] dataLayer push failed", err);
    }
  }

  if (debug) {
    console.log("[analytics]", event);
  }
}

/* -------------------------------------------------- */
/* Public API                                          */
/* -------------------------------------------------- */

export function track(
  name: string,
  data: Record<string, any> = {},
  options: AnalyticsOptions = {}
) {
  if (typeof window === "undefined") return;

  const { sampleRate = 1, fireAndForget = false } = options;

  // Sampling
  const rate = Math.min(Math.max(sampleRate, 0), 1);
  if (Math.random() > rate) return;

  const event: AnalyticsEvent = {
    type: "track",
    name: name.trim(),
    data: sanitizeMetadata(data),
    timestamp: new Date().toISOString(),
    version: 1,
  };

  emit(event, options);

  if (!fireAndForget) return event;
}

export function identify(
  userId: string,
  traits: Record<string, any> = {},
  options: AnalyticsOptions = {}
) {
  if (typeof window === "undefined") return;

  const event: AnalyticsEvent = {
    type: "identify",
    name: "identify",
    userId: userId.trim(),
    traits: sanitizeMetadata(traits),
    timestamp: new Date().toISOString(),
    version: 1,
  };

  emit(event, options);

  return event;
}

export function page(
  name: string,
  data: Record<string, any> = {},
  options: AnalyticsOptions = {}
) {
  if (typeof window === "undefined") return;

  const event: AnalyticsEvent = {
    type: "page",
    name: name.trim(),
    data: sanitizeMetadata(data),
    timestamp: new Date().toISOString(),
    version: 1,
  };

  emit(event, options);

  return event;
}
