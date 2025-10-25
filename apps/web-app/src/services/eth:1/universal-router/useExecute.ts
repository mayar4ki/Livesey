import { universalRouterAbi } from '@/_config/uniswap-v4-deployments/ABI';
import { CHAIN_TO_ADDRESSES_MAP, CHAIN_TO_ADDRESSES_MAP_KEYS } from '@/_config/uniswap-v4-deployments/CHAIN_TO_ADDRESSES_MAP';
import { UNIVERSAL_ROUTER_CREATION_BLOCK } from '@uniswap/universal-router-sdk';
import type { WriteContractParameters } from 'viem';
import { useChainId, useWriteContract, UseWriteContractParameters } from 'wagmi';

type abi = typeof universalRouterAbi;

export const useExecute = (params?: UseWriteContractParameters) => {
  const chainId = useChainId() as CHAIN_TO_ADDRESSES_MAP_KEYS;

  const { writeContract: _writeContract, writeContractAsync: _writeContractAsync, ..._mutate } = useWriteContract(params);

  const writeContract = (params: Omit<WriteContractParameters<abi, 'execute'>, 'abi' | 'address' | 'functionName' | 'account' | 'chain'>) => {
    _writeContract({
      abi: UNIVERSAL_ROUTER_CREATION_BLOCK,
      address: CHAIN_TO_ADDRESSES_MAP[chainId].Universal_Router,
      chainId,
      functionName: 'execute',
      ...(params as any),
    });
  };

  return { writeContract, ..._mutate };
};
