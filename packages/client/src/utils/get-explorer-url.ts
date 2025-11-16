import { Hash } from "viem";
import { sepolia } from "viem/chains";

/**
 * Get the block explorer URL for a transaction / address / hash / block / token hash based on chain ID
 * @param hash - Transaction hash
 * @param chainId - Chain ID (defaults to mainnet if not provided)
 * @returns Block explorer URL for the transaction / address / hash / block / token
 */
export function getExplorerUrl(hash: Hash, chainId: number): string {
  if (chainId === sepolia.id) {
    return `https://eth-sepolia.blockscout.com/search-results?q=${hash.toLowerCase()}`;
    // return `https://sepolia.etherscan.io/search?q=${hash.toLowerCase()}`;
  }
  return `https://etherscan.io/tx/${hash}`;
}
