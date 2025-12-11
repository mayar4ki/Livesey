'use client';

import { useQueryParams } from '@acme/client/hooks';
import { useTokenList } from '@acme/client/services/token/useTokenList';
import { formatDateTime, getChainUIName } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { DataTablePagination } from '@acme/ui/bootstrapped/data-table-pagination';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
import { Coins, Plus } from 'lucide-react';
import Link from 'next/link';
import { TokenActionsMenu } from './_components/TokenActionsMenu';

export default function Page() {
  const { params, setParams } = useQueryParams({ take: 10, skip: 0 });
  const { data, isLoading, error } = useTokenList({ skip: params.skip, take: params.take });

  if (isLoading) {
    return <LoadingCard message="Loading token list..." />;
  }

  if (error) {
    return (
      <ErrorStateCard icon={Coins} title="Error Loading Tokens" message={error instanceof Error ? error.message : 'Failed to load token list'} />
    );
  }

  return (
    <div className="p-4 md:p-6 flex-1 ">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Token List</CardTitle>
            </div>
            <Button asChild>
              <Link href="/token/create">
                <Plus className="h-4 w-4 mr-2" />
                Create New Token
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Coins className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tokens Found</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">No tokens have been deployed yet. Deploy a token to see it here.</p>
              <Button asChild>
                <Link href="/token/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Token
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Total Supply</TableHead>
                  <TableHead>Contract Address</TableHead>
                  <TableHead>Chain</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell>
                      <Link href={`/token/${token.token}`} className="font-medium hover:underline cursor-pointer">
                        {token.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{token.symbol}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{BigInt(token.totalSupply).toLocaleString('en-US')}</span>
                    </TableCell>
                    <TableCell>
                      <ExplorerLink hash={token.token} chainId={token.chainId} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getChainUIName(token.chainId)}</Badge>
                    </TableCell>
                    <TableCell>{token.operator && <ExplorerLink hash={token.operator.address} chainId={token.chainId} />}</TableCell>
                    <TableCell>
                      <ExplorerLink hash={token.createdBy} chainId={token.chainId} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{formatDateTime(token.createdAt)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <TokenActionsMenu token={token} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <DataTablePagination
            currentPage={Math.floor(params.skip / params.take) + 1}
            totalPages={data?.pagination?.total ? Math.ceil(data?.pagination?.total / data?.pagination?.take) : 0}
            onPageChange={(page: number) => {
              setParams({ skip: (page - 1) * params.take, take: params.take });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
