import { formatUnits } from 'viem';
import { useLimitOrderTokens } from '~/services/1inche/useLimitOrderTokens';
import { LimitOrder } from '~/services/limit-order';
import { getOurTokenDecimals } from '~/utils/token-decimals';

export const useGetOrderTokensInfo = () => {
  const { tokenMap } = useLimitOrderTokens();
  const getOrderTokensInfo = (order: LimitOrder) => {
    // Determine if user's token is makeToken or takeToken
    const isUserTokenMake = order?.token?.token.toLowerCase() === order.makeToken.toLowerCase();
    const isUserTokenTake = order?.token?.token.toLowerCase() === order.takeToken.toLowerCase();

    // Get token info for both tokens
    const makeTokenInfo = isUserTokenMake ? { ...order.token, decimals: getOurTokenDecimals() } : tokenMap.get(order.makeToken);
    const takeTokenInfo = isUserTokenTake ? { ...order.token, decimals: getOurTokenDecimals() } : tokenMap.get(order.takeToken);

    const make = Number(formatUnits(BigInt(order.makeAmount), makeTokenInfo?.decimals ?? 18));
    const take = Number(formatUnits(BigInt(order.takeAmount), takeTokenInfo?.decimals ?? 18));
    const price = +(isUserTokenTake ? make / take : take / make).toFixed(4);

    return { makeTokenInfo, takeTokenInfo, isUserTokenMake, isUserTokenTake, _price: price };
  };

  return getOrderTokensInfo;
};
