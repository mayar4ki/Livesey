import { mainnet, sepolia } from "viem/chains";

// Get chain configuration based on chain ID
export function getChain(chainId: number) {
  switch (chainId) {
    case sepolia.id:
      return sepolia;
    case mainnet.id:
      return mainnet;
  }
}
