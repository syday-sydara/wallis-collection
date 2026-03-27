// lib/metrics.ts

export function startTimer(label: string) {
  const start = performance.now();

  return () => {
    const end = performance.now();
    const duration = end - start;

    console.log(
      JSON.stringify({
        metric: label,
        ms: duration,
        timestamp: new Date().toISOString()
      })
    );

    return duration;
  };
}
