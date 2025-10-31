import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

import { metaMask } from 'wagmi/connectors';

export const getConfig = () => {
  return createConfig({
    chains: [
      // mainnet,
      sepolia,
    ],
    connectors: [metaMask()],
    transports: {
      //  [mainnet.id]: http(process.env.NEXT_PUBLIC_ETH_CHAIN_RPC_URL),
      [sepolia.id]: http(process.env.NEXT_PUBLIC_ETH_SEPOLIA_CHAIN_RPC_URL),
    },
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
  });
};
