'use client';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

import { Check, Network } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export const ChainsMenu = () => {
  const chainId = useChainId();

  const { isConnecting, isReconnecting, chain } = useAccount();

  const { chains, switchChain } = useSwitchChain();

  const isLoading = isConnecting || isReconnecting;

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger as-child disabled={isLoading}>
          <Button variant="ghost" className="px-2 ">
            <span className="hidden sm:block"> {chains.find((el) => el.id == chainId)?.name}</span>
            <Network size="20" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {chains.map((chain) => (
            <DropdownMenuItem key={chain.id} onClick={() => switchChain({ chainId: chain.id })}>
              {chain.name}
              {chain.id === chainId && <Check />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
