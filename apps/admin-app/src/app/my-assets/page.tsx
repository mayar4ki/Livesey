'use client';

import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
import { Coins, ExternalLink, Wallet } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { ErrorStateCard } from '~/_components/common/ErrorStateCard';
import { LoadingCard } from '~/_components/common/LoadingCard';
import { formatAddress } from '~/helpers/formatAddress';
import { getChainName } from '~/helpers/getChainName';
import { getContractExplorerUrl } from '~/helpers/getContractExplorerUrl';
import { useWalletAssets } from '~/services/token/useWalletAssets';

export default function Page() {
  const { address: walletAddress } = useAccount();
  const chainId = useChainId();
  const { data, isLoading, error } = useWalletAssets();
  const assets = data?.tokens || [];

  if (isLoading) {
    return <LoadingCard message="Loading your assets..." />;
  }

  if (error) {
    return (
      <ErrorStateCard icon={Wallet} title="Error Loading Assets" message={error instanceof Error ? error.message : 'Failed to load wallet assets'} />
    );
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            My Assets
          </CardTitle>
          <CardDescription>
            View all ERC-20 tokens in your wallet on {getChainName(chainId)}
            {walletAddress && ` (${formatAddress(walletAddress)})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
              <p className="text-sm text-muted-foreground text-center">You don't have any ERC-20 tokens in this wallet on {getChainName(chainId)}.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {assets.length} token{assets.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Contract Address</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.contractAddress}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* <Avatar className="h-8 w-8">
                            {asset.logo && <AvatarImage src={asset.logo} alt={asset.name || asset.symbol || 'Token'} />}
                            <AvatarFallback className="text-xs">{asset.symbol ? asset.symbol.slice(0, 2).toUpperCase() : 'T'}</AvatarFallback>
                          </Avatar> */}
                          <div className="flex flex-col">
                            <span className="font-medium">{asset.name || asset.symbol || 'Unknown Token'}</span>
                            {asset.symbol && asset.name && <span className="text-xs text-muted-foreground">{asset.symbol}</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-medium">
                          {parseFloat(asset.balance || '0').toLocaleString(undefined, {
                            maximumFractionDigits: 6,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{formatAddress(asset.contractAddress)}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getChainName(data?.chainId || chainId)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild className="h-8">
                          <a
                            href={getContractExplorerUrl(asset.contractAddress, data?.chainId || chainId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
