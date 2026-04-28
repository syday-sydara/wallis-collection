// lib/core/tracing.ts

import { performance } from "perf_hooks";
import { serviceContext } from "./service-context";

export interface SpanData {
  id: string;
  name: string;
  start: number;
  end?: number;
  duration?: number;
  parentId?: string;
  traceId: string;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

let spanCounter = 0;

// Optional: in-memory trace store (useful for debugging)
const activeTraces = new Map<string, SpanData[]>();

function generateSpanId() {
  return `span_${++spanCounter}`;
}

function now() {
  return performance.now();
}

export class Span {
  id: string;
  name: string;
  traceId: string;
  parentId?: string;
  startTime: number;
  metadata: Record<string, any>;
  children: Span[] = [];

  constructor(name: string, meta: Record<string, any> = {}, parent?: Span) {
    this.id = generateSpanId();
    this.name = name;
    this.startTime = now();
    this.metadata = meta;

    const ctx = serviceContext.get();

    this.traceId = ctx.traceId ?? `trace_${Date.now()}_${Math.random()}`;
    this.parentId = parent?.id;

    // Register span in trace store
    if (!activeTraces.has(this.traceId)) {
      activeTraces.set(this.traceId, []);
    }

    activeTraces.get(this.traceId)!.push({
      id: this.id,
      name: this.name,
      start: this.startTime,
      traceId: this.traceId,
      parentId: this.parentId,
      metadata: this.metadata,
    });

    if (parent) {
      parent.children.push(this);
    }
  }

  /**
   * End the span and record metadata.
   */
  end(meta: Record<string, any> = {}) {
    const endTime = now();
    const duration = endTime - this.startTime;

    const trace = activeTraces.get(this.traceId);
    if (!trace) return;

    const span = trace.find((s) => s.id === this.id);
    if (!span) return;

    span.end = endTime;
    span.duration = duration;
    span.metadata = { ...span.metadata, ...meta };
  }

  /**
   * Create a nested child span.
   */
  child(name: string, meta: Record<string, any> = {}) {
    return new Span(name, meta, this);
  }
}

/**
 * Start a new span.
 */
export function startSpan(name: string, meta: Record<string, any> = {}, parent?: Span) {
  return new Span(name, meta, parent);
}

/**
 * Retrieve a full trace by traceId.
 */
export function getTrace(traceId: string) {
  return activeTraces.get(traceId) ?? null;
}

/**
 * Clear all traces (useful for tests).
 */
export function clearTraces() {
  activeTraces.clear();
}
