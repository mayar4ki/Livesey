import { LimitOrderType } from '@acme/db';
import { formatUnits } from 'viem';
import { useLimitOrderTokens } from '~/services/1inche/useLimitOrderTokens';
import { LimitOrder } from '~/services/limit-order';
import { getOurTokenDecimals } from '~/utils/token-decimals';

export const useGetOrderTokensInfo = () => {
  const { tokenMap } = useLimitOrderTokens();
  const getOrderTokensInfo = (order: LimitOrder) => {
    // Determine if user's token is makeToken or takeToken
    const isSell = order?.type === LimitOrderType.SELL;

    // Get token info for both tokens
    const makeTokenInfo = isSell ? { ...order.token, decimals: getOurTokenDecimals() } : tokenMap.get(order.makeToken);
    const takeTokenInfo = !isSell ? { ...order.token, decimals: getOurTokenDecimals() } : tokenMap.get(order.takeToken);

    const make = Number(formatUnits(BigInt(order.makeAmount), makeTokenInfo?.decimals ?? 18));
    const take = Number(formatUnits(BigInt(order.takeAmount), takeTokenInfo?.decimals ?? 18));
    const price = +(isSell ? take / make : make / take).toFixed(4);

    return { makeTokenInfo, takeTokenInfo, _price: price };
  };

  return getOrderTokensInfo;
};
