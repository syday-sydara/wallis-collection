// lib/utils/sleep.ts

/**
 * Sleep helper for async delays
 * @param ms - milliseconds to wait
 * @example
 * await sleep(1000); // waits for 1 second
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));