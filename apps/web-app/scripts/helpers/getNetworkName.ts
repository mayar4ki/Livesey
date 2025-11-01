import { sepolia, mainnet } from 'viem/chains';

/**
 * Get network name from chainId
 */
export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case sepolia.id:
      return 'sepolia';
    case mainnet.id:
      return 'mainnet';
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}
