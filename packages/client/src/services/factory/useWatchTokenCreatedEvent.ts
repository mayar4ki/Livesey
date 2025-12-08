import { FactoryAbi as ABI } from "@acme/smart-contract";
import { Address } from "viem";
import { UseWatchContractEventParameters, useWatchContractEvent } from "wagmi";
const ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

export const useWatchTokenCreatedEvent = (
  params: UseWatchContractEventParameters<typeof ABI, "TokenCreated">
) => {
  useWatchContractEvent({
    ...params,
    address: ADDRESS,
    abi: ABI,
    eventName: "TokenCreated",
  });
};
