import { FactoryAbi } from "@acme/smart-contract";
import { Address } from "viem";
import { useReadContract } from "wagmi";

const ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;
/**
 * Hook to fetch factory contract general information
 * @returns Factory contract data including beacon address, owner address, and paused status
 */
export function useFactoryInfo() {
  const { data: beaconAddress, isLoading: isLoadingBeacon } = useReadContract({
    address: ADDRESS,
    abi: FactoryAbi,
    functionName: "beaconAddress",
  });

  const { data: ownerAddress, isLoading: isLoadingOwner } = useReadContract({
    address: ADDRESS,
    abi: FactoryAbi,
    functionName: "owner",
  });

  const { data: paused, isLoading: isLoadingPaused } = useReadContract({
    address: ADDRESS,
    abi: FactoryAbi,
    functionName: "paused",
  });

  const { data: adminAddress, isLoading: isLoadingAdmin } = useReadContract({
    address: ADDRESS,
    abi: FactoryAbi,
    functionName: "admin",
  });

  return {
    beaconAddress: beaconAddress,
    ownerAddress: ownerAddress,
    adminAddress: adminAddress,
    paused: paused,
    isLoading:
      isLoadingBeacon || isLoadingOwner || isLoadingPaused || isLoadingAdmin,
  };
}
