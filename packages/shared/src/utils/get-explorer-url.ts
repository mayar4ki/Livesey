import { Hash } from "viem";
import { sepolia } from "viem/chains";

/**
 * Get the block explorer URL for a transaction hash based on chain ID
 * @param hash - Transaction hash
 * @param chainId - Chain ID (defaults to mainnet if not provided)
 * @returns Block explorer URL for the transaction
 */
export function getExplorerUrl(hash: Hash, chainId: number): string {
  if (chainId === sepolia.id) {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  }
  return `https://etherscan.io/tx/${hash}`;
}
