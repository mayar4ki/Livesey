import { ERC20ImplementationAbi } from '@acme/smart-contract';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';

export const useTokenDecimals = (token?: Address) => {
  const q = useReadContract({
    address: token,
    abi: ERC20ImplementationAbi,
    functionName: 'decimals',
    query: { enabled: !!token },
  });

  return q;
};
