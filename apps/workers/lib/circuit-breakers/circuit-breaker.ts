// lib/circuit-breaker.ts
import { Correlation } from "../correlation";
import { logger } from "../logger";
import { metrics } from "../metrics";

type State = "CLOSED" | "OPEN" | "HALF_OPEN";

interface PersistedState {
  state: State;
  failures: number;
  successes: number;
  nextAttempt: number;
  openedAt?: number;
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;

  onStateChange?: (name: string, from: State, to: State, durationMs?: number) => void;
  onFailure?: (name: string, error: any) => void;
  onSuccess?: (name: string) => void;

  store?: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any, ttlMs: number) => Promise<void>;
  };
}

export class CircuitBreaker {
  private state: State = "CLOSED";
  private failures = 0;
  private successes = 0;
  private nextAttempt = 0;
  private openedAt: number | null = null;

  private forcedState: State | null = null;

  constructor(
    private readonly options: CircuitBreakerOptions,
    private readonly name: string
  ) {}

  private key() {
    return `circuit:${this.name}`;
  }

  // ------------------------------------------------------
  // Load persisted state (worker-safe)
  // ------------------------------------------------------
  async load() {
    if (!this.options.store) return;

    try {
      const persisted = await this.options.store.get(this.key());
      if (!persisted) return;

      this.state = persisted.state;
      this.failures = persisted.failures;
      this.successes = persisted.successes;
      this.nextAttempt = persisted.nextAttempt;
      this.openedAt = persisted.openedAt ?? null;
    } catch (err: any) {
      logger.error("Circuit breaker load failed", { breaker: this.name, error: err?.message });
    }
  }

  // ------------------------------------------------------
  // Persist state (safe)
  // ------------------------------------------------------
  private async persist() {
    if (!this.options.store) return;

    try {
      const ttl = this.state === "OPEN" ? this.options.timeoutMs : 60_000;

      await this.options.store.set(
        this.key(),
        {
          state: this.state,
          failures: this.failures,
          successes: this.successes,
          nextAttempt: this.nextAttempt,
          openedAt: this.openedAt,
        },
        ttl
      );
    } catch (err: any) {
      logger.error("Circuit breaker persist failed", { breaker: this.name, error: err?.message });
    }
  }

  // ------------------------------------------------------
  // State transition (correlation-aware)
  // ------------------------------------------------------
  private transition(to: State) {
    const from = this.state;
    if (from === to) return;

    Correlation.withSpan(() => {
      const ctx = Correlation.get();

      let duration: number | undefined;
      if (from === "OPEN" && this.openedAt) {
        duration = Date.now() - this.openedAt;
      }

      logger.info("Circuit breaker state change", {
        breaker: this.name,
        from,
        to,
        durationMs: duration,
        spanId: ctx.spanId,
        parentSpanId: ctx.parentSpanId,
        workflowId: ctx.workflowId,
      });

      metrics.increment("circuit_breaker_transition_total", {
        breaker: this.name,
        from,
        to,
      });

      if (duration !== undefined) {
        metrics.observe("circuit_breaker_open_duration_ms", duration, {
          breaker: this.name,
        });
      }

      this.state = to;

      if (to === "OPEN") {
        this.openedAt = Date.now();
      }

      this.options.onStateChange?.(this.name, from, to, duration);

      this.persist();
    });
  }

  // ------------------------------------------------------
  // Request permission logic
  // ------------------------------------------------------
  private canRequest() {
    if (this.forcedState) return this.forcedState !== "OPEN";

    const now = Date.now();

    if (this.state === "OPEN") {
      if (now >= this.nextAttempt) {
        this.transition("HALF_OPEN");
        return true;
      }
      return false;
    }

    return true;
  }

  // ------------------------------------------------------
  // Success handler
  // ------------------------------------------------------
  private onSuccess() {
    Correlation.withSpan(() => {
      this.options.onSuccess?.(this.name);

      metrics.increment("circuit_breaker_success_total", {
        breaker: this.name,
      });

      if (this.state === "HALF_OPEN") {
        this.successes += 1;

        if (this.successes >= this.options.successThreshold) {
          this.transition("CLOSED");
          this.failures = 0;
          this.successes = 0;
        }
      } else {
        this.failures = 0;
      }

      this.persist();
    });
  }

  // ------------------------------------------------------
  // Failure handler
  // ------------------------------------------------------
  private onFailure(err: any) {
    Correlation.withSpan(() => {
      this.options.onFailure?.(this.name, err);

      metrics.increment("circuit_breaker_failure_total", {
        breaker: this.name,
      });

      this.failures += 1;

      if (this.failures >= this.options.failureThreshold) {
        this.transition("OPEN");
        this.nextAttempt = Date.now() + this.options.timeoutMs;
        this.successes = 0;
      }

      this.persist();
    });
  }

  // ------------------------------------------------------
  // Execute protected function
  // ------------------------------------------------------
  async exec<T>(fn: () => Promise<T>): Promise<T> {
    return Correlation.withSpan(async () => {
      if (!this.canRequest()) {
        metrics.increment("circuit_breaker_blocked_total", {
          breaker: this.name,
        });

        throw new Error(`CircuitBreaker[${this.name}] is OPEN`);
      }

      try {
        const result = await fn();
        this.onSuccess();
        return result;
      } catch (err) {
        this.onFailure(err);
        throw err;
      }
    });
  }

  // ------------------------------------------------------
  // Manual overrides
  // ------------------------------------------------------
  forceOpen() {
    this.forcedState = "OPEN";
  }

  forceClosed() {
    this.forcedState = "CLOSED";
  }

  clearOverride() {
    this.forcedState = null;
  }

  getState() {
    return this.forcedState ?? this.state;
  }
}
