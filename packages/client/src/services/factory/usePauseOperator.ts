import { FactoryAbi as ABI } from "@acme/smart-contract";
import { MutateOptions, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
const ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

export const usePauseOperator = () => {
  const queryClient = useQueryClient();
  const { writeContract, data, ...rest } = useWriteContract();

  function pauseOperator(operatorAddress: Address, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: "pauseOperator",
        args: [operatorAddress],
      },
      options as never
    );
  }

  const transactionReceipt = useWaitForTransactionReceipt({
    hash: data,
    query: {
      enabled: !!data,
    },
  });

  useEffect(() => {
    if (transactionReceipt.isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ["readContract", { address: ADDRESS }],
      });
    }
  }, [transactionReceipt.isSuccess, queryClient]);

  return {
    pauseOperator,
    data,
    ...rest,
    transactionReceipt,
  };
};

export const useUnpauseOperator = () => {
  const queryClient = useQueryClient();
  const { writeContract, data, ...rest } = useWriteContract();

  function unpauseOperator(operatorAddress: Address, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: "unpauseOperator",
        args: [operatorAddress],
      },
      options as never
    );
  }

  const transactionReceipt = useWaitForTransactionReceipt({
    hash: data,
    query: {
      enabled: !!data,
    },
  });

  useEffect(() => {
    if (transactionReceipt.isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ["readContract", { address: ADDRESS }],
      });
    }
  }, [transactionReceipt.isSuccess, queryClient]);

  return {
    unpauseOperator,
    data,
    ...rest,
    transactionReceipt,
  };
};
