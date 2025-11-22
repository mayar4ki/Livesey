/**
 * Format a token amount from its raw string value to a human-readable format
 * Handles very large numbers (with abbreviations), very small numbers (with scientific notation),
 * and regular numbers (with thousand separators and appropriate decimal places)
 * @param amount - Token amount as a string (in smallest unit, e.g., wei)
 * @param decimals - Number of decimals for the token (default: 18)
 * @returns Formatted amount string
 */
export function formatTokenAmount(amount: string, decimals: number = 18): string {
  try {
    const bigIntAmount = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const wholePart = bigIntAmount / divisor;
    const fractionalPart = bigIntAmount % divisor;

    // Convert to number for formatting (handle large numbers carefully)
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');

    // Format the number
    const wholePartNum = Number(wholePart);
    const decimalPartNum = trimmedFractional ? parseFloat(`0.${trimmedFractional}`) : 0;
    const totalNum = wholePartNum + decimalPartNum;

    // Handle zero
    if (totalNum === 0) {
      return '0';
    }

    // Handle very small numbers (< 0.000001)
    if (totalNum > 0 && totalNum < 0.000001) {
      // Use scientific notation for extremely small numbers
      const scientific = totalNum.toExponential(4);
      return scientific.replace(/e\+?(-?\d+)/, 'e$1');
    }

    // Abbreviate very large numbers
    if (totalNum >= 1_000_000_000_000) {
      const trillions = totalNum / 1_000_000_000_000;
      return `${trillions.toFixed(2).replace(/\.?0+$/, '')}T`;
    }
    if (totalNum >= 1_000_000_000) {
      const billions = totalNum / 1_000_000_000;
      return `${billions.toFixed(2).replace(/\.?0+$/, '')}B`;
    }
    if (totalNum >= 1_000_000) {
      const millions = totalNum / 1_000_000;
      return `${millions.toFixed(2).replace(/\.?0+$/, '')}M`;
    }
    if (totalNum >= 1_000) {
      const thousands = totalNum / 1_000;
      return `${thousands.toFixed(2).replace(/\.?0+$/, '')}K`;
    }

    // For numbers >= 1, show with thousand separators and up to 6 decimals
    if (totalNum >= 1) {
      if (fractionalPart === BigInt(0)) {
        return wholePartNum.toLocaleString('en-US', { maximumFractionDigits: 0 });
      }
      return totalNum.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      });
    }

    // For numbers < 1, show significant digits (up to 8 decimal places)
    // Calculate how many decimal places we need to show at least 4 significant digits
    const significantDigits = Math.max(4, Math.floor(-Math.log10(totalNum)) + 4);
    const maxDecimals = Math.min(significantDigits, 8);
    const formatted = totalNum.toFixed(maxDecimals);
    return formatted.replace(/\.?0+$/, '') || '0';
  } catch {
    return amount;
  }
}

/**
 * Format a price/ratio number to a human-readable format
 * Handles very large prices (with abbreviations) and very small prices (with appropriate precision)
 * @param price - Price as a number
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  try {
    // Handle very large prices
    if (price >= 1_000_000_000_000) {
      const trillions = price / 1_000_000_000_000;
      return `${trillions.toFixed(2).replace(/\.?0+$/, '')}T`;
    }
    if (price >= 1_000_000_000) {
      const billions = price / 1_000_000_000;
      return `${billions.toFixed(2).replace(/\.?0+$/, '')}B`;
    }
    if (price >= 1_000_000) {
      const millions = price / 1_000_000;
      return `${millions.toFixed(2).replace(/\.?0+$/, '')}M`;
    }
    if (price >= 1_000) {
      const thousands = price / 1_000;
      return `${thousands.toFixed(2).replace(/\.?0+$/, '')}K`;
    }
    if (price >= 1) {
      // For prices >= 1, show up to 4 decimal places with thousand separators
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      });
    }
    // For prices < 1, show up to 8 significant digits
    const significantDigits = Math.max(1, Math.floor(-Math.log10(price)) + 4);
    const formatted = price.toFixed(Math.min(significantDigits, 8));
    return formatted.replace(/\.?0+$/, '') || '0';
  } catch {
    return price.toString();
  }
}

