/**
 * Calculate risk score for a user/order.
 * 
 * Example usage: combine multiple fraud signals.
 */
export const calculateRiskScore = (weights: number[]): number => {
  if (!Array.isArray(weights)) return 0;

  const total = weights.reduce((acc, w) => acc + (w || 0), 0);
  // Normalize to 0-100 scale
  return Math.min(100, Math.max(0, total));
};