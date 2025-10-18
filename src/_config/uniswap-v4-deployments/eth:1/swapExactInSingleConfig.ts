import { ETH_TOKEN, USDC_TOKEN } from '@/_config/uniswap-v4-deployments/eth:1';
import { SwapExactInSingleV2 } from '@/_config/uniswap-v4-deployments/types/v4-sdk';
import { CommandType, RoutePlanner } from '@uniswap/universal-router-sdk';
import { Actions, V4Planner } from '@uniswap/v4-sdk';
import { Address, parseUnits } from 'viem';

export const CurrentConfig: SwapExactInSingleV2 = {
  poolKey: {
    currency0: ETH_TOKEN.address as Address,
    currency1: USDC_TOKEN.address as Address,
    fee: 500,
    tickSpacing: 10,
    hooks: '0x0000000000000000000000000000000000000000',
  },
  zeroForOne: true, // The direction of swap is ETH to USDC. Change it to 'false' for the reverse direction
  amountIn: parseUnits('1', ETH_TOKEN.decimals),
  amountOutMinimum: 'minAmountOut', // Change according to the slippage desired
  hookData: '0x00',
};

const quoteExactInputSingleArgs = [
  {
    poolKey: CurrentConfig.poolKey,
    zeroForOne: CurrentConfig.zeroForOne,
    exactAmount: CurrentConfig.amountIn,
    hookData: CurrentConfig.hookData,
  },
] as const;

const getExecuteArgs = () => {
  const v4Planner = new V4Planner();
  const routePlanner = new RoutePlanner();

  // Set deadline (1 hour from now)
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  v4Planner.addAction(Actions.SWAP_EXACT_IN_SINGLE, [swapExactInSingleConfig.current]);
  v4Planner.addAction(Actions.SETTLE_ALL, [swapExactInSingleConfig.current.poolKey.currency0, swapExactInSingleConfig.current.amountIn]);
  v4Planner.addAction(Actions.TAKE_ALL, [swapExactInSingleConfig.current.poolKey.currency1, swapExactInSingleConfig.current.amountOutMinimum]);

  const encodedActions = v4Planner.finalize();

  routePlanner.addCommand(CommandType.V4_SWAP, [v4Planner.actions, v4Planner.params]);

  return {
    args: [routePlanner.commands as Address, [encodedActions] as Address[], BigInt(deadline)],
    txOptions: {
      value: CurrentConfig.amountIn,
    },
  } as const;
};

export const swapExactInSingleConfig = {
  current: CurrentConfig,
  quoteExactInputSingleArgs,
  getExecuteArgs,
};
