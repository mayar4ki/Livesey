'use client';

import { formatAddress, getExplorerUrl } from '@acme/client/utils';
import { cn } from '@acme/ui';

type ExplorerLinkProps = {
  hash: string;
  chainId: number;
  className?: string;
  showFull?: boolean;
};

/**
 * A link to the block explorer for a given hash
 * @param hash - The hash to link to (transaction hash, address, block number, token hash, etc.)
 * @param chainId - The chain ID
 * @param className - The class name
 * @param showFull - Whether to show the full hash or a truncated version (default: false)
 */
export function ExplorerLink({ hash, chainId, className, showFull = false }: ExplorerLinkProps) {
  return (
    <a
      href={getExplorerUrl(hash as `0x${string}`, chainId)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'text-xs font-mono bg-muted px-2 py-1 rounded hover:bg-muted/80 cursor-pointer transition-colors inline-block break-all',
        className
      )}
    >
      {showFull ? hash : formatAddress(hash)}
    </a>
  );
}
