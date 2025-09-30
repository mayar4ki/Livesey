import { CurrentConfig } from "@/_config/uniswap-v4-deployments/eth:1";
import { useQuery } from "@tanstack/react-query";
import { contract } from "./contract";

export const useQuoteExactInputSingle = () => {
  const _query = useQuery({
    queryKey: ["quotedAmountOut", CurrentConfig],
    queryFn: () =>
      contract.quoteExactInputSingle.staticCall({
        poolKey: CurrentConfig.poolKey,
        zeroForOne: CurrentConfig.zeroForOne,
        exactAmount: CurrentConfig.amountIn,
        hookData: CurrentConfig.hookData,
      }),
  });

  return _query;
};
