'use client';

import { formatAddress, getContractExplorerUrl } from '@acme/shared/utils';
import { cn } from '@acme/ui';

type ExplorerAddressLinkProps = {
  address: string;
  chainId: number;
  className?: string;
};

export function ExplorerAddressLink({ address, chainId, className }: ExplorerAddressLinkProps) {
  return (
    <a
      href={getContractExplorerUrl(address, chainId)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('text-xs font-mono bg-muted px-2 py-1 rounded hover:bg-muted/80 cursor-pointer transition-colors inline-block', className)}
    >
      {formatAddress(address)}
    </a>
  );
}
