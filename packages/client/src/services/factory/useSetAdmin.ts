import { FactoryAbi as ABI } from "@acme/smart-contract";
import { MutateOptions } from "@tanstack/react-query";
import { Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import type { WriteContractParameters } from "wagmi/actions";
const ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

type SetAdminWriteParams = WriteContractParameters<typeof ABI, "setAdmin">;
type SetAdminArgs = NonNullable<SetAdminWriteParams["args"]>;

export const useSetAdmin = () => {
  const { writeContract, data, ...rest } = useWriteContract();

  function setAdmin(newAdminAddress: Address, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: "setAdmin",
        args: [newAdminAddress],
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
    setAdmin,
    data,
    ...rest,
    transactionReceipt,
  };
};
