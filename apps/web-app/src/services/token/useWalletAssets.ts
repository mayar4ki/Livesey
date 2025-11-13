import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { sepolia } from 'viem/chains';

export interface AlchemyResponse {
  data: {
    tokens: Token[];
  };
}

export interface Token {
  address: string;
  network: string;
  tokenAddress?: string;
  tokenBalance: string;
  tokenMetadata: TokenMetadata;
  tokenPrices: any[];
}

export interface TokenMetadata {
  symbol?: string;
  decimals?: number;
  name?: string;
  logo: any;
}

export interface AssetsResponse {
  tokens: Token[];
  walletAddress: string;
  chainId: number;
}

export function useWalletAssets(walletAddress: string | undefined, chainId: number) {
  return useQuery({
    queryKey: ['wallet-assets', walletAddress, chainId],
    queryFn: async ({ signal }) =>
      await axios.post<AlchemyResponse>(
        `https://api.g.alchemy.com/data/v1/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/assets/tokens/by-address`,
        {
          addresses: [
            {
              address: walletAddress!,
              networks: [chainId === sepolia.id ? 'eth-sepolia' : 'eth-mainnet'],
            },
          ],
        },
        {
          signal,
        }
      ),
    enabled: !!walletAddress && !!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  });
}
