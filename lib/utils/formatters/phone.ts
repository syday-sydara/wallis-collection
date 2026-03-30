/**
 * Format Nigerian phone numbers into a consistent international format.
 *
 * Examples:
 *  - 0803 123 4567 => +234 803 123 4567
 *  - +2348031234567 => +234 803 123 4567
 */
export const formatPhoneNumber = (input: string): string => {
  if (!input) return "";

  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("234")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  const NIGERIAN_NUMBER_LENGTH = 10;

  if (digits.length !== NIGERIAN_NUMBER_LENGTH) {
    return input; // fallback
  }

  return `+234 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
};