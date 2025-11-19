import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';
import { OperatorInfo } from './useOperators';

/**
 * Hook to fetch a single operator's information from the Factory contract
 * @param operatorAddress - The address of the operator to fetch
 * @returns Operator info and loading state
 */
export function useOperator(operatorAddress: Address | undefined) {
  const { data, isLoading } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: 'operatorsLedger',
    args: operatorAddress ? [operatorAddress] : undefined,
    query: {
      enabled: !!operatorAddress,
    },
  });

  // The contract returns a tuple: (address operator, bool isPaused)
  const operatorInfo: OperatorInfo | undefined = data
    ? {
        operator: data[0],
        isPaused: data[1],
      }
    : undefined;

  return {
    operator: operatorInfo,
    isLoading,
  };
}
