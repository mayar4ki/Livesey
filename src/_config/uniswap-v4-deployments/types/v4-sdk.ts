import { SwapExactInSingle } from '@uniswap/v4-sdk';
import { Address } from 'viem';

export type PoolKeyV2 = {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
};

export type SwapExactInSingleV2 = Omit<SwapExactInSingle, 'amountIn' | 'poolKey' | 'hookData'> & {
  amountIn: bigint;
  poolKey: PoolKeyV2;
  hookData: Address;
};

export interface AddressSet {
  PoolManager: Address;
  PositionDescriptor?: Address; // sepolia don't have
  PositionManager: Address;
  Quoter: Address;
  StateView: Address;
  Universal_Router: Address;
  Permit2: Address;
  PoolSwapTest?: Address;
  PoolModifyLiquidityTest?: Address;
}
