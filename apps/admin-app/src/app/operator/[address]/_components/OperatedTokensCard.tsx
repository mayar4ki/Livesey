'use client';

import { useDebouncedCallback, useQueryParams } from '@acme/client/hooks';
import { useTokenList } from '@acme/client/services/token/useTokenList';
import { formatDateTime, getChainUIName } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { DataTablePagination } from '@acme/ui/bootstrapped/data-table-pagination';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardHeader } from '@acme/ui/card';
import { Input } from '@acme/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
import { Coins, Plus, Search } from 'lucide-react';
import Link from 'next/link';

import { Address } from 'viem';

export const OperatedTokensCard = ({ address }: { address: Address }) => {
  const { params, setParams } = useQueryParams({ take: 10, skip: 0, search: '' });

  const { data, isLoading, error } = useTokenList({ skip: params.skip, take: params.take, search: params.search, operator: address });

  const debouncedSetParams = useDebouncedCallback(setParams);

  if (error) {
    return (
      <ErrorStateCard icon={Coins} title="Error Loading Tokens" message={error instanceof Error ? error.message : 'Failed to load token list'} />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, symbol, or address..."
            defaultValue={params.search}
            onChange={(e) => debouncedSetParams({ search: e.target.value, skip: 0 })}
            className="pl-9"
          />
        </div>
      </CardHeader>
      {isLoading ? (
        <LoadingCard message="Loading token list..." />
      ) : (
        <CardContent>
          {data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Coins className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tokens Found</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {params.search ? 'No tokens match your search criteria.' : 'No tokens have been deployed yet. Deploy a token to see it here.'}
              </p>
              {!params.search && (
                <Button asChild>
                  <Link href="/token/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Token
                  </Link>
                </Button>
              )}
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
                    <TableCell>
                      {token.operator && (
                        <Link href={`/operator/${token.operator.address}`} className="font-medium hover:underline cursor-pointer">
                          {token.operator.name}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      <ExplorerLink hash={token.createdBy} chainId={token.chainId} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{formatDateTime(token.createdAt)}</span>
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
      )}
    </Card>
  );
};
