import { formatUnits } from "viem";

/**
 * Format a token amount from its raw string value to a human-readable format
 * Handles very large numbers (with abbreviations), very small numbers (with scientific notation),
 * and regular numbers (with thousand separators and appropriate decimal places)
 * @param amount - Token amount as a string (in smallest unit, e.g., wei)
 * @param decimals - Number of decimals for the token (default: 18)
 * @returns Formatted amount string
 */
export function formatTokenAmount(
  amount: string,
  decimals: number = 18
): string {
  const t = Number(formatUnits(BigInt(amount), decimals));

  if (t < 1000) return t.toString();
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(t);
}

/**
 * Format a price/ratio number to a human-readable format
 * Handles very large prices (with abbreviations) and very small prices (with appropriate precision)
 * @param price - Price as a number
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  if (price < 1000) return price.toString();
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(price);
}
