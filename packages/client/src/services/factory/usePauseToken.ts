import { FactoryAbi } from "@acme/smart-contract";
import { MutateOptions, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

const ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

export const usePauseToken = () => {
  const queryClient = useQueryClient();
  const { writeContract, data, ...rest } = useWriteContract();

  function pauseToken(tokenAddress: Address, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: FactoryAbi,
        functionName: "pauseToken",
        args: [tokenAddress],
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
    pauseToken,
    data,
    ...rest,
    transactionReceipt,
  };
};

export const useUnpauseToken = () => {
  const queryClient = useQueryClient();
  const { writeContract, data, ...rest } = useWriteContract();

  function unpauseToken(tokenAddress: Address, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: FactoryAbi,
        functionName: "unpauseToken",
        args: [tokenAddress],
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
    unpauseToken,
    data,
    ...rest,
    transactionReceipt,
  };
};
