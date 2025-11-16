import { Hash } from "viem";
import { sepolia } from "viem/chains";

export type ExplorerHashType =
  | "transaction"
  | "address"
  | "contract"
  | "contract-code"
  | "token"
  | "token-holders"
  | "token-code"
  | "block";

/**
 * Get the block explorer URL for a transaction / address / hash / block / token hash based on chain ID
 * @param hash - Transaction hash, address, block number, or token hash
 * @param chainId - Chain ID
 * @param type - Type of hash (transaction, address, contract, token, token-holders, contract-code, block)
 * @returns Block explorer URL for the specified type
 */
export function getExplorerUrl(
  hash: Hash,
  chainId: number,
  type?: ExplorerHashType
): string {
  const hashLower = hash.toLowerCase();

  if (chainId === sepolia.id) {
    // Blockscout URLs for Sepolia
    const baseUrl = "https://eth-sepolia.blockscout.com";

    switch (type) {
      case "transaction":
        return `${baseUrl}/tx/${hashLower}`;
      case "address":
        return `${baseUrl}/address/${hashLower}`;
      case "contract":
        return `${baseUrl}/address/${hashLower}`;
      case "contract-code":
        return `${baseUrl}/address/${hashLower}?tab=contract`;
      case "token":
        return `${baseUrl}/token/${hashLower}`;
      case "token-holders":
        return `${baseUrl}/token/${hashLower}?tab=holders`;
      case "token-code":
        return `${baseUrl}/token/${hashLower}?tab=contract`;
      case "block":
        return `${baseUrl}/block/${hashLower}`;
      default:
        return `${baseUrl}/search-results?q=${hashLower}`;
    }
  }

  // Etherscan URLs for mainnet
  const baseUrl = "https://etherscan.io";

  switch (type) {
    case "transaction":
      return `${baseUrl}/tx/${hashLower}`;
    case "address":
      return `${baseUrl}/address/${hashLower}`;
    case "contract":
      return `${baseUrl}/address/${hashLower}`;
    case "token":
      return `${baseUrl}/token/${hashLower}`;
    case "token-holders":
      return `${baseUrl}/token/${hashLower}#balances`;
    case "contract-code":
      return `${baseUrl}/address/${hashLower}#code`;
    case "block":
      return `${baseUrl}/block/${hashLower}`;
    default:
      return `${baseUrl}/tx/${hashLower}`;
  }
}
