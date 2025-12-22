import { oneInchLimitOrderProtocolAddresses } from "@acme/shared";

/**
 * Get the 1inch Limit Order Protocol contract address for a given chain ID
 * @param chainId - The chain ID
 * @returns The contract address or undefined if not supported
 */
export function get1inchLimitOrderProtocolAddress(
  chainId: number
): `0x${string}` | undefined {
  return oneInchLimitOrderProtocolAddresses[chainId];
}

/**
 * Base currency configuration
 * Each chain can have multiple base currencies (WETH, USDC, USDT, etc.)
 */
export interface BaseCurrency {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
}

export const BASE_CURRENCIES: Record<number, BaseCurrency[]> = {
  // Ethereum Mainnet
  1: [
    {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as `0x${string}`,
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
    },
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as `0x${string}`,
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" as `0x${string}`,
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
    },
  ],
  // Sepolia Testnet
  11155111: [
    {
      address: "0xB179689962d3390bfFCbB0b20D56f2931171E216" as `0x${string}`,
      symbol: "AED",
      name: "UAE Dirham",
      decimals: 6,
    },
  ],
};

/**
 * Get available base currencies for a given chain ID
 * @param chainId - The chain ID
 * @returns Array of base currencies or empty array if not supported
 */
export function getBaseCurrencies(chainId: number): BaseCurrency[] {
  return BASE_CURRENCIES[chainId] || [];
}

/**
 * Get the default base currency address for a given chain ID
 * @param chainId - The chain ID
 * @returns The default base currency address (typically WETH) or undefined if not supported
 */
export function getBaseCurrencyAddress(
  chainId: number
): `0x${string}` | undefined {
  const currencies = BASE_CURRENCIES[chainId];
  return currencies?.[0]?.address;
}
