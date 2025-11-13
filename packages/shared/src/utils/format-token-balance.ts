/**
 * Format a token balance from its raw string value to a human-readable format
 * @param balance - Token balance as a string (in smallest unit, e.g., wei)
 * @param decimals - Number of decimals for the token (default: 18)
 * @param maximumFractionDigits - Maximum number of decimal places to show (default: 6)
 * @returns Formatted balance string
 */
export function formatTokenBalance(
  balance: string,
  decimals: number = 18,
  maximumFractionDigits: number = 6
): string {
  const balanceNumber = parseFloat(balance || "0");
  const formattedBalance = balanceNumber / Math.pow(10, decimals);

  return formattedBalance.toLocaleString(undefined, {
    maximumFractionDigits,
  });
}
