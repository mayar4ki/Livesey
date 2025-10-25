import { quoterAbi } from '@/_config/uniswap-v4-deployments/ABI';
import { CHAIN_TO_ADDRESSES_MAP, CHAIN_TO_ADDRESSES_MAP_KEYS } from '@/_config/uniswap-v4-deployments/CHAIN_TO_ADDRESSES_MAP';

import { zeroAddress } from 'viem';
import { useChainId, useSimulateContract, UseSimulateContractParameters } from 'wagmi';

export type UseQuoteExactInputSingleParams = UseSimulateContractParameters<typeof quoterAbi, 'quoteExactInputSingle'>;

export const useQuoteExactInputSingle = (params: UseQuoteExactInputSingleParams) => {
  const chainId = useChainId() as CHAIN_TO_ADDRESSES_MAP_KEYS;

  const _query = useSimulateContract({
    account: zeroAddress,
    address: CHAIN_TO_ADDRESSES_MAP[chainId].Quoter,
    abi: quoterAbi,
    functionName: 'quoteExactInputSingle',
    ...params,
  });

  return _query;
};
