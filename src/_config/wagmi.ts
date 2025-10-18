import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

const connectors = () => {
  // Only create connectors on client-side to avoid SSR issues
  // TODO: update when https://github.com/rainbow-me/rainbowkit/issues/2476 is resolved
  if (typeof window === 'undefined') {
    return [];
  }

  return [
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
    }),
  ];
};

export const getConfig = () => {
  return createConfig({
    chains: [
      // mainnet,
       bsc
      // sepolia, arbitrum
    ],
    transports: {
    //  [mainnet.id]: http(process.env.NEXT_PUBLIC_ETH_CHAIN_RPC_URL),
      [bsc.id]:http(),
      // [sepolia.id]: http(process.env.NEXT_PUBLIC_ETH_SEPOLIA_CHAIN_RPC_URL),
      // [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARB_CHAIN_RPC_URL),
    },
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
  });
};
