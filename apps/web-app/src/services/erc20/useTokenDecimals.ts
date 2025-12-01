import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { ERC20ImplementationAbi } from '../../../../../packages/core-contract';

export const useTokenDecimals = (token?: Address) => {
  const q = useReadContract({
    address: token,
    abi: ERC20ImplementationAbi,
    functionName: 'decimals',
    query: { enabled: !!token },
  });

  return q;
};
