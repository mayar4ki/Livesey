import { ERC20ImplementationAbi } from '@acme/smart-contract';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';

export const useTokenTotalSupply = (token?: Address) => {
  return useReadContract({
    address: token,
    abi: ERC20ImplementationAbi,
    functionName: 'totalSupply',
    query: { enabled: !!token },
  });
};
