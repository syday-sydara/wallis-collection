const isDev = process.env.NODE_ENV !== "production";

function logMetric(type: string, name: string, value?: number, labels?: Record<string, any>) {
  const timestamp = new Date().toISOString();

  if (isDev) {
    const parts = [`[METRIC]`, type, name];
    if (value !== undefined) parts.push(`value=${value}`);
    if (labels) parts.push(`labels=${JSON.stringify(labels)}`);
    parts.push(timestamp);
    console.log(parts.join(" "));
  } else {
    console.log(
      JSON.stringify({
        metric: type,
        name,
        value,
        labels,
        timestamp,
      })
    );
  }
}

export const metrics = {
  increment: (name: string, labels?: Record<string, any>) =>
    logMetric("increment", name, undefined, labels),

  record: (name: string, value: number, labels?: Record<string, any>) =>
    logMetric("record", name, value, labels),

  timing: (name: string, ms: number, labels?: Record<string, any>) =>
    logMetric("timing", name, ms, labels),
};
