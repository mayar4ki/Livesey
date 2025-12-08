import { FactoryAbi } from "@acme/smart-contract";
import { MutateOptions, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

const ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

export const useSetTokenOperator = (tokenId: string) => {
  const queryClient = useQueryClient();
  const { writeContract, data, ...rest } = useWriteContract();

  function setTokenOperator(
    tokenAddress: Address,
    operatorAddress: Address,
    options?: MutateOptions
  ) {
    writeContract(
      {
        address: ADDRESS,
        abi: FactoryAbi,
        functionName: "setTokenOperator",
        args: [tokenAddress, operatorAddress],
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
      queryClient.invalidateQueries({
        queryKey: ["token", tokenId],
      });
    }
  }, [transactionReceipt.isSuccess, queryClient]);

  return {
    setTokenOperator,
    data,
    ...rest,
    transactionReceipt,
  };
};
