import { useQuery } from '@tanstack/react-query';
import { useAccount, useChainId } from 'wagmi';
import axios from 'axios';
import { sepolia } from 'viem/chains';

type AlchemyToken = {
  contractAddress: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  logo?: string;
  balance: string;
};

type AlchemyResponse = {
  data?: {
    addresses?: Array<{
      address: string;
      networks?: Array<{
        network: string;
        tokens?: AlchemyToken[];
      }>;
    }>;
  };
  error?: string;
};

export type TokenAsset = {
  contractAddress: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  logo?: string;
  balance: string;
};

export type AssetsResponse = {
  tokens?: AlchemyToken[];
  walletAddress: string;
  chainId: number;
};

export function useWalletAssets() {
  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId();

  return useQuery({
    queryKey: ['wallet-assets', walletAddress, chainId],
    queryFn: async ({ signal }) => {
      const network = chainId === sepolia.id ? 'eth-sepolia' : 'eth-mainnet';

      const { data } = await axios.post<AlchemyResponse>(
        `https://api.g.alchemy.com/data/v1/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/assets/tokens/by-address`,
        {
          addresses: [
            {
              address: walletAddress,
              networks: [network],
            },
          ],
        },
        {
          signal,
        }
      );

      return {
        tokens: data.data?.addresses?.[0]?.networks?.[0]?.tokens,
        walletAddress,
        chainId,
      };
    },
    enabled: isConnected && !!walletAddress,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
