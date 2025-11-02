/**
 * Format an Ethereum address to a shortened version
 * @param address - Full Ethereum address (0x + 40 hex characters)
 * @returns Formatted address in the format: 0x1234...5678
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

