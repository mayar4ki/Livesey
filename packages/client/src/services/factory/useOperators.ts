import { FactoryAbi } from "@acme/smart-contract";
import { Address } from "viem";
import { useReadContract } from "wagmi";

const ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

export type OperatorInfo = {
  operator: `0x${string}`;
  isPaused: boolean;
};

/**
 * Hook to fetch all operators from the Factory contract
 * @returns Operators array and loading state
 */
export function useOperators() {
  // First, get the total number of operators
  const { data: operatorsLength, isLoading: isLoadingLength } = useReadContract(
    {
      address: ADDRESS,
      abi: FactoryAbi,
      functionName: "getOperatorsLength",
    }
  );

  // Then fetch all operators if we have a length > 0
  const shouldFetchOperators =
    operatorsLength !== undefined && operatorsLength > 0n;

  const { data: operatorsData, isLoading: isLoadingOperators } =
    useReadContract({
      address: ADDRESS,
      abi: FactoryAbi,
      functionName: "getOperators",
      args: shouldFetchOperators ? [0n, operatorsLength] : undefined,
      query: {
        enabled: shouldFetchOperators,
      },
    });

  // Extract operators from the returned tuple (operators array, next cursor)
  // If length is 0 or undefined, return empty array
  const operators: OperatorInfo[] =
    shouldFetchOperators && operatorsData?.[0] ? [...operatorsData[0]] : [];

  return {
    operators,
    totalCount: operatorsLength ? Number(operatorsLength) : 0,
    isLoading: isLoadingLength || (shouldFetchOperators && isLoadingOperators),
  };
}
