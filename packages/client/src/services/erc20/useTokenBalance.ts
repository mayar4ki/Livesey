import { Address } from 'viem';
import { useAccount, useBalance } from 'wagmi';

export const useTokenBalance = (token?: Address) => {
  const { address: userAddress } = useAccount();

  const q = useBalance({
    address: userAddress,
    token: token,
    query: { enabled: !!token && !!userAddress },
  });

  return q;
};
