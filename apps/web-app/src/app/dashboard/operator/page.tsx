'use client';

import { useDebouncedCallback, useQueryParams } from '@acme/client/hooks';
import { useOperatorList } from '@acme/client/services/operator/useOperatorList';
import { formatAddress, getChainUIName } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { DataTablePagination } from '@acme/ui/bootstrapped/data-table-pagination';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Input } from '@acme/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
import { Plus, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { useChainId } from 'wagmi';

export default function Page() {
  const chainId = useChainId();
  const { params, setParams } = useQueryParams({ take: 10, skip: 0, search: '' });
  const { data, isLoading } = useOperatorList({
    chainId,
    skip: params.skip,
    take: params.take,
    search: params.search,
  });

  const debouncedSetParams = useDebouncedCallback(setParams);
  const operators = data?.data ?? [];
  const totalCount = data?.pagination?.total ?? 0;

  return (
    <div className="p-4 md:p-6 flex-1">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Operators</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {totalCount} {totalCount === 1 ? 'operator' : 'operators'} registered
              </p>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or address..."
              defaultValue={params.search}
              onChange={(e) => debouncedSetParams({ search: e.target.value, skip: 0 })}
              className="pl-9"
            />
          </div>
        </CardHeader>

        {isLoading ? (
          <LoadingCard message="Loading operators..." />
        ) : (
          <CardContent>
            {operators.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Operators Found</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {params.search
                    ? 'No operators match your search criteria.'
                    : 'No operators have been registered yet.'}
                </p>
                {!params.search && (
                  <Button asChild>
                    <Link href="/operator/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Operator
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operators.map((operator) => (
                    <TableRow key={operator.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/operator/${operator.address}`}
                          className="font-medium hover:underline cursor-pointer"
                        >
                          {operator.name || formatAddress(operator.address)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <ExplorerLink hash={operator.address} chainId={chainId} showFull />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getChainUIName(operator.chainId)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={operator.isPaused ? 'destructive' : 'default'}>
                          {operator.isPaused ? 'Paused' : 'Active'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <DataTablePagination
              currentPage={Math.floor(params.skip / params.take) + 1}
              totalPages={data?.pagination?.total ? Math.ceil(data.pagination.total / params.take) : 0}
              onPageChange={(page: number) => {
                setParams({ skip: (page - 1) * params.take, take: params.take });
              }}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
