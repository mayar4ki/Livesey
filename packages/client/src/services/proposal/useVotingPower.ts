import { useTokenBalance } from '../erc20/useTokenBalance';
import { useTokenTotalSupply } from '../erc20/useTokenTotalSupply';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { useMemo } from 'react';

interface VotingPowerResult {
  percentageHeld: number | null;
  hasRequiredPower: boolean;
  isLoading: boolean;
  isConnected: boolean;
}

export function useVotingPower(token?: Address, requiredPercentage: bigint = 20n): VotingPowerResult {
  const { isConnected } = useAccount();
  const { data: balanceData, isFetching: isBalanceLoading } = useTokenBalance(token);
  const { data: totalSupplyData, isFetching: isSupplyLoading } = useTokenTotalSupply(token);

  const { percentageHeld, hasRequiredPower } = useMemo(() => {
    if (!isConnected || !balanceData?.value || !totalSupplyData || totalSupplyData === 0n) {
      return { percentageHeld: null, hasRequiredPower: false };
    }

    const hasRequiredPower =
      balanceData.value * 100n >= BigInt(totalSupplyData) * requiredPercentage;

    const percentageTimesHundred = (balanceData.value * 10000n) / BigInt(totalSupplyData);
    const percentageHeld = Number(percentageTimesHundred) / 100;

    return { percentageHeld, hasRequiredPower };
  }, [balanceData?.value, totalSupplyData, isConnected, requiredPercentage]);

  return {
    percentageHeld,
    hasRequiredPower,
    isLoading: isBalanceLoading || isSupplyLoading,
    isConnected,
  };
}
