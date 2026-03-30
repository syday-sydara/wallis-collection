/**
 * Sleep helper for async delays
 * @param ms milliseconds to wait
 */
export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));