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
      //[mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
    },
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
  });
};
