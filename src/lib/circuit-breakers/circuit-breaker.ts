// lib/circuit-breaker.ts
type State = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;

  // Optional hooks
  onStateChange?: (name: string, from: State, to: State) => void;
  onFailure?: (name: string, error: any) => void;
  onSuccess?: (name: string) => void;

  // Optional distributed store (Redis, etc.)
  store?: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string, ttlMs: number) => Promise<void>;
  };
}

export class CircuitBreaker {
  private state: State = "CLOSED";
  private failures = 0;
  private successes = 0;
  private nextAttempt = 0;

  private forcedState: State | null = null;

  constructor(
    private readonly options: CircuitBreakerOptions,
    private readonly name: string
  ) {}

  private transition(to: State) {
    const from = this.state;
    if (from !== to) {
      this.state = to;
      this.options.onStateChange?.(this.name, from, to);
    }
  }

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

  private onSuccess() {
    this.options.onSuccess?.(this.name);

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
  }

  private onFailure(err: any) {
    this.options.onFailure?.(this.name, err);

    this.failures += 1;

    if (this.failures >= this.options.failureThreshold) {
      this.transition("OPEN");
      this.nextAttempt = Date.now() + this.options.timeoutMs;
      this.successes = 0;
    }
  }

  async exec<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canRequest()) {
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
  }

  // Manual override
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
