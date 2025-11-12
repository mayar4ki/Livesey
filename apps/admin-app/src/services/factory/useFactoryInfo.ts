import { useReadContract } from 'wagmi';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

/**
 * Hook to fetch factory contract general information
 * @returns Factory contract data including beacon address, owner address, and paused status
 */
export function useFactoryInfo() {
  const { data: beaconAddress, isLoading: isLoadingBeacon } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: 'beacon',
  });

  const { data: ownerAddress, isLoading: isLoadingOwner } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: 'owner',
  });

  const { data: paused, isLoading: isLoadingPaused } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: 'paused',
  });

  const { data: adminAddress, isLoading: isLoadingAdmin } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: 'admin',
  });

  return {
    beaconAddress: beaconAddress,
    ownerAddress: ownerAddress,
    adminAddress: adminAddress,
    paused: paused,
    isLoading: isLoadingBeacon || isLoadingOwner || isLoadingPaused || isLoadingAdmin,
  };
}
