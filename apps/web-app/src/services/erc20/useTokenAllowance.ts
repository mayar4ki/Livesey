import { ERC20ImplementationAbi } from '@acme/smart-contract';
import { Address } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

export const useTokenAllowance = (
  token: Address,
  args: {
    spender: Address;
    owner?: Address;
  }
) => {
  const { address } = useAccount();

  const owner = args.owner ?? address;

  const q = useReadContract({
    address: token,
    abi: ERC20ImplementationAbi,
    functionName: 'allowance',
    args: [owner!, args.spender],
    query: { enabled: !!owner && !!args.spender },
  });

  return q;
};
