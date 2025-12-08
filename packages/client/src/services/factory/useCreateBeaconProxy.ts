import { FactoryAbi as ABI } from "@acme/smart-contract";
import { MutateOptions } from "@tanstack/react-query";
import { Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import type { WriteContractParameters } from "wagmi/actions";
const ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

type CreateBeaconProxyWriteParams = WriteContractParameters<
  typeof ABI,
  "createToken"
>;
type CreateBeaconProxyArgs = NonNullable<CreateBeaconProxyWriteParams["args"]>;

export const useCreateToken = () => {
  const { writeContract, data, ...rest } = useWriteContract();

  function createToken(args: CreateBeaconProxyArgs, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: "createToken",
        args,
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

  return {
    createToken,
    data,
    ...rest,
    transactionReceipt,
  };
};
