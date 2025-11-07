'use client';

import { formatAddress, getChainUIName, getContractExplorerUrl } from '@acme/shared/utils';
import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
import { ExternalLink, FileCode } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ErrorStateCard } from '~/_components/common/ErrorStateCard';
import { LoadingCard } from '~/_components/common/LoadingCard';
import { useContractHistory } from '~/services/token/useContractHistory';

export default function Page() {
  const { address: walletAddress } = useAccount();
  const { data, isLoading, error } = useContractHistory();
  const contracts = data?.contracts || [];

  if (isLoading) {
    return <LoadingCard message="Loading contract history..." />;
  }

  if (error) {
    return (
      <ErrorStateCard
        icon={FileCode}
        title="Error Loading History"
        message={error instanceof Error ? error.message : 'Failed to load contract history'}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
          <CardDescription>View all verified contracts deployed by {walletAddress}</CardDescription>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Contracts Found</h3>
              <p className="text-sm text-muted-foreground text-center">
                You haven't verified any contracts yet. Deploy and verify a contract to see it here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract Address</TableHead>
                  <TableHead>Chain</TableHead>
                  <TableHead>Verified At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{formatAddress(contract.contractAddress)}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getChainUIName(contract.chainId)}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(contract.verifiedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="h-8">
                        <a
                          href={getContractExplorerUrl(contract.contractAddress, contract.chainId)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
