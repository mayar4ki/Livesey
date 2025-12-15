'use client';

import { useDebouncedCallback, useQueryParams } from '@acme/client/hooks';
import { useLimitOrders } from '@acme/client/services/limit-order/useLimitOrders';
import { DataTablePagination } from '@acme/ui/bootstrapped/data-table-pagination';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Input } from '@acme/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@acme/ui/select';
import { ArrowRightLeft, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { useChainId } from 'wagmi';
import { LimitOrdersTable } from '../_components/limit-order/LimitOrdersTable';

export default function LimitOrderPage() {
  const chainId = useChainId();
  const { params, setParams } = useQueryParams({ take: 10, skip: 0, search: '' });
  const [statusFilter, setStatusFilter] = useState<'pending' | 'filled' | 'cancelled' | 'expired' | 'all'>('all');

  const debouncedSetParams = useDebouncedCallback(setParams);

  const { data, isLoading, error } = useLimitOrders({
    skip: params.skip,
    take: params.take,
    status: statusFilter === 'all' ? undefined : statusFilter,
    chainId,
    search: params.search,
  });

  const orders = data?.data || [];
  const total = data?.pagination?.total || 0;

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <ErrorStateCard
          icon={ArrowRightLeft}
          title="Error Loading Limit Orders"
          message={error instanceof Error ? error.message : 'Failed to load limit orders'}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Limit Order Orderbook
              </CardTitle>
              <CardDescription>View all limit orders across all chains. Total: {total} orders</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as typeof statusFilter);
                  setParams({ skip: 0, take: params.take });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order hash, maker, token address, name, or symbol..."
              defaultValue={params.search}
              onChange={(e) => debouncedSetParams({ search: e.target.value, skip: 0 })}
              className="pl-9"
            />
          </div>
        </CardHeader>

        {isLoading ? (
          <LoadingCard message="Loading limit orders..." />
        ) : (
          <CardContent>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ArrowRightLeft className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {params.search
                    ? 'No orders match your search criteria.'
                    : statusFilter === 'all'
                      ? 'No limit orders available at the moment.'
                      : `No ${statusFilter} orders found.`}
                </p>
              </div>
            ) : (
              <>
                <LimitOrdersTable orders={orders} />
                <DataTablePagination
                  currentPage={Math.floor(params.skip / params.take) + 1}
                  totalPages={
                    data?.pagination?.total ? Math.ceil(data?.pagination?.total / data?.pagination?.take) : 0
                  }
                  onPageChange={(page: number) => {
                    setParams({ skip: (page - 1) * params.take, take: params.take });
                  }}
                />
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
