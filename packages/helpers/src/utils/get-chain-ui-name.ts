import { mainnet, sepolia } from "viem/chains";

/**
 * Get the human-readable name of a chain by its chain ID
 * @param chainId - Chain ID number
 * @returns Chain name or fallback format
 */
export function getChainUIName(chainId: number): string {
  switch (chainId) {
    case sepolia.id:
      return "Sepolia";
    case mainnet.id:
      return "Mainnet";
    default:
      return `Chain ${chainId}`;
  }
}
