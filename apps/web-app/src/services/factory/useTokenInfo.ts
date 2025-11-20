import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

export type TokenInfo = {
  token: `0x${string}`;
  name: string;
  symbol: string;
  assetRefHash: `0x${string}`;
  totalSupply: bigint;
  operator: `0x${string}`;
  isPaused: boolean;
};

/**
 * Hook to fetch a token's information from the Factory contract
 * @param tokenAddress - The address of the token to fetch
 * @returns Token info and loading state
 */
export function useTokenInfo(tokenAddress: Address | undefined) {
  const { data, isLoading } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: 'tokensLedger',
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!tokenAddress,
    },
  });

  // The contract returns a tuple: (address token, string name, string symbol, bytes32 assetRefHash, uint256 totalSupply, address operator, bool isPaused)
  const tokenInfo: TokenInfo | undefined = data
    ? {
        token: data[0],
        name: data[1],
        symbol: data[2],
        assetRefHash: data[3],
        totalSupply: data[4],
        operator: data[5],
        isPaused: data[6],
      }
    : undefined;

  return {
    tokenInfo,
    isLoading,
  };
}
