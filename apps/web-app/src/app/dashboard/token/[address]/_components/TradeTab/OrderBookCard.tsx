'use client';

import { useQueryParams } from '@acme/client/hooks';

import { cn } from '@acme/ui';
import { DataTablePagination } from '@acme/ui/bootstrapped/data-table-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLimitOrderColumns } from '~/app/dashboard/_hooks/useLimitOrderColumns';

import { LimitOrder } from '~/services/limit-order';
import { LimitOrderType } from '~/services/limit-order/useCreateLimitOrder';
import { useLimitOrdersByToken } from '~/services/limit-order/useLimitOrdersByToken';
import { Token } from '~/services/token/useToken';
import { LimitOrderDrawer } from './LimitOrderDrawer';

export interface OrderBookCardProps {
  token: Token;
}

export function OrderBookCard({ token }: OrderBookCardProps) {
  const { params, setParams } = useQueryParams({ take: 10, skip: 0 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading, isError } = useLimitOrdersByToken(token.token, token.chainId, {
    skip: params.skip,
    take: params.take,
  });

  const columns = useLimitOrderColumns({
    filter: ['pair', 'type'],
  });

  const table = useReactTable<LimitOrder>({
    data: (data?.data ?? []).map((el) => ({ ...el, token })),
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Use server-side pagination
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const totalPages = useMemo(() => {
    if (!data?.pagination?.total) return 1;
    return Math.ceil(data.pagination.total / params.take);
  }, [data?.pagination?.total, params.take]);

  return (
    <Card>
      <CardHeader>
        <div className=" flex items-center justify-between">
          <CardTitle>Order Book</CardTitle>
          <div className="block xl:hidden">
            <LimitOrderDrawer token={token} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {isError && <div className="text-center py-8 text-destructive">Failed to load orders</div>}
          {!isLoading && !isError && (
            <>
              <div className="rounded-md border">
                <Table wrapperClassName="max-h-[500px] relative overflow-auto">
                  <TableHeader className="sticky top-0  z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => {
                        const order = row.original;
                        return (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                            className={cn(order.type === LimitOrderType.SELL ? 'bg-red-500/5' : 'bg-green-500/5')}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          No orders yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {data?.pagination && data.pagination.total > 0 && (
                <DataTablePagination
                  currentPage={Math.floor(params.skip / params.take) + 1}
                  totalPages={totalPages}
                  onPageChange={(page: number) => {
                    setParams({ skip: (page - 1) * params.take, take: params.take });
                  }}
                />
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
