// lib/core/events.ts

type EventHandler<T = any> = (payload: T) => void | Promise<void>;

interface HandlerEntry<T = any> {
  handler: EventHandler<T>;
  once: boolean;
}

const listeners = new Map<string, HandlerEntry[]>();
const wildcardListeners: HandlerEntry[] = [];

const DEFAULT_TIMEOUT = 5000; // 5 seconds

// Optional hook for debugging or metrics
let onEventDebug: ((event: string, payload: any) => void) | null = null;

export function setEventDebugHook(
  fn: (event: string, payload: any) => void
) {
  onEventDebug = fn;
}

export const events = {
  on<T = any>(event: string, handler: EventHandler<T>) {
    if (!listeners.has(event)) listeners.set(event, []);
    listeners.get(event)!.push({ handler, once: false });
  },

  once<T = any>(event: string, handler: EventHandler<T>) {
    if (!listeners.has(event)) listeners.set(event, []);
    listeners.get(event)!.push({ handler, once: true });
  },

  onAny(handler: EventHandler<{ event: string; payload: any }>) {
    wildcardListeners.push({ handler, once: false });
  },

  async emit<T = any>(event: string, payload: T) {
    // Debug hook
    if (onEventDebug) {
      try {
        onEventDebug(event, payload);
      } catch {
        // Never let debug hook break emit()
      }
    }

    const specificHandlers = listeners.get(event) ?? [];
    const allHandlers: HandlerEntry[] = [...specificHandlers];

    // Add wildcard handlers
    for (const entry of wildcardListeners) {
      allHandlers.push({
        handler: () => entry.handler({ event, payload }),
        once: entry.once,
      });
    }

    const executions = allHandlers.map(async (entry) => {
      const { handler, once } = entry;

      const exec = Promise.resolve().then(() => handler(payload));

      const timeout = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Event handler timeout: ${event}`)),
          DEFAULT_TIMEOUT
        )
      );

      try {
        await Promise.race([exec, timeout]);
      } catch (err) {
        console.error(`Event handler failed for "${event}":`, err);
      }

      // Cleanup once-handlers
      if (once) {
        const arr = listeners.get(event);
        if (arr) {
          const idx = arr.indexOf(entry);
          if (idx !== -1) arr.splice(idx, 1);
        }
      }
    });

    await Promise.allSettled(executions);
  },
};
