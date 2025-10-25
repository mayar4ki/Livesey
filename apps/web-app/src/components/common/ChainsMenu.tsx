'use client';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

import { Check, Container } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export const ChainsMenu = () => {
  const chainId = useChainId();

  const { isConnecting, isReconnecting, chain } = useAccount();

  const { chains, switchChain } = useSwitchChain();

  const isLoading = isConnecting || isReconnecting;

  return null;
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger as-child disabled={isLoading}>
          <Button variant="default" className="px-2 rounded-full">
            <span className="hidden sm:block"> {chains.find((el) => el.id == chainId)?.name}</span>
            <Container size="20" />
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
