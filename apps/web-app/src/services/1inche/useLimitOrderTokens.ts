import { useMemo } from 'react';
import { useChainId } from 'wagmi';
import { getBaseCurrencies } from './config';

export const useLimitOrderTokens = () => {
  const chainId = useChainId();

  const tokens = getBaseCurrencies(chainId);

  // Create a map of token addresses to token info for quick lookup
  const tokenMap = useMemo(() => {
    const map = new Map<string, { name: string; symbol: string; decimals: number }>();
    tokens.forEach((token) => {
      map.set(token.address, {
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
      });
    });
    return map;
  }, [tokens]);

  return { tokens, tokenMap };
};
