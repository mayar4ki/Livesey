import { arbitrum, mainnet, sepolia } from 'viem/chains';
import { address as arbitrumOneAddress } from './arbitrum-one:42161/address';
import { address as ethAddress } from './eth:1/address';
import { address as sepoliaAddress } from './sepolia:11155111/address';

export const CHAIN_TO_ADDRESSES_MAP = {
  [mainnet.id]: ethAddress,
  [sepolia.id]: sepoliaAddress,
  [arbitrum.id]: arbitrumOneAddress,
};

export type CHAIN_TO_ADDRESSES_MAP_KEYS = keyof typeof CHAIN_TO_ADDRESSES_MAP;
