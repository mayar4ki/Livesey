import { useChainId } from 'wagmi';
import { getBaseCurrencies } from '~/_config/1inch';

export const useLimitOrderTokens = () => {
  const chainId = useChainId();

  const tokens = getBaseCurrencies(chainId);

  return { tokens };
};
