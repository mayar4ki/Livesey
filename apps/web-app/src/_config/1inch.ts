/**
 * 1inch Limit Order Protocol contract addresses
 * Source: https://docs.1inch.io/docs/limit-order-protocol/smart-contract
 */
export const ONEINCH_LIMIT_ORDER_PROTOCOL_ADDRESSES: Record<number, `0x${string}`> = {
  // Ethereum Mainnet
  1: '0x1111111254fb6c44bac0bed2854e76f90643097d' as `0x${string}`,
  // Sepolia Testnet
  11155111: '0x1111111254fb6c44bac0bed2854e76f90643097d' as `0x${string}`,
  // Add more chains as needed
  // Polygon: 137
  // BSC: 56
  // etc.
};

/**
 * Get the 1inch Limit Order Protocol contract address for a given chain ID
 * @param chainId - The chain ID
 * @returns The contract address or undefined if not supported
 */
export function get1inchLimitOrderProtocolAddress(chainId: number): `0x${string}` | undefined {
  return ONEINCH_LIMIT_ORDER_PROTOCOL_ADDRESSES[chainId];
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
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as `0x${string}`,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`,
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
  ],
  // Sepolia Testnet
  11155111: [
    {
      address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14' as `0x${string}`,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    },
    {
      address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6b14' as `0x${string}`,
      symbol: 'WETH2',
      name: 'Wrapped Ether2',
      decimals: 18,
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
export function getBaseCurrencyAddress(chainId: number): `0x${string}` | undefined {
  const currencies = BASE_CURRENCIES[chainId];
  return currencies?.[0]?.address;
}
