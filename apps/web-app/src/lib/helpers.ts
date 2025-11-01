import { Hash, type Address } from 'viem';
import { sepolia } from 'wagmi/chains';

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

/**
 * Get the block explorer URL for a contract address based on chain ID
 * @param address - Contract address
 * @param chainId - Chain ID (defaults to mainnet if not provided)
 * @returns Block explorer URL for the contract
 */
export function getContractExplorerUrl(address: Address | string, chainId: number): string {
  if (chainId === sepolia.id) {
    return `https://eth-sepolia.blockscout.com/token/${address.toLowerCase()}?tab=contract`;
  }
  return `https://etherscan.io/address/${address}`;
}
