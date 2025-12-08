'use client';

import { Token } from '@acme/client/services/token/types';
import { getExplorerUrl } from '@acme/client/utils';
import { Button } from '@acme/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@acme/ui/dropdown-menu';
import { toast } from '@acme/ui/sonner';
import { Copy, ExternalLink, Eye, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

type TokenActionsMenuProps = {
  token: Token;
};

export function TokenActionsMenu({ token }: TokenActionsMenuProps) {
  const router = useRouter();
  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('Token address copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const handleShow = () => {
    router.push(`/token/${token.id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleShow}>
          <Eye className="h-4 w-4 mr-2" />
          Show
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            window.open(getExplorerUrl(token.token as `0x${string}`, token.chainId), '_blank', 'noopener,noreferrer');
          }}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopyAddress(token.token)}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Token Address
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
