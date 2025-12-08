import { useChainId } from 'wagmi';
import { get1inchLimitOrderProtocolAddress } from './config';

export const useLimitOrderProtocolAddress = () => {
  const chainId = useChainId();
  const address = get1inchLimitOrderProtocolAddress(chainId);

  return { address };
};
