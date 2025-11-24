'use client';

import { useQueryParams } from '@acme/client/hooks';
import { formatDateTime, formatPrice, formatTokenAmount } from '@acme/client/utils';
import { cn } from '@acme/ui';
import { Badge } from '@acme/ui/badge';
import { DataTableColumnSortHeader } from '@acme/ui/bootstrapped/data-table-column-sort-header';
import { DataTablePagination } from '@acme/ui/bootstrapped/data-table-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useGetOrderTokensInfo } from '~/_hooks/useGetOrderTokensInfo';
import { getStatusBadgeVariant } from '~/_utils/getStatusBadgeVariant';
import { LimitOrderActions } from '~/app/dashboard/limit-order/_components/LimitOrderActions';

import { LimitOrder } from '~/services/limit-order';
import { useLimitOrdersByToken } from '~/services/limit-order/useLimitOrdersByToken';
import { Token } from '~/services/token/useToken';

type Trade = {
  id: string;
  type: 'buy' | 'sell';
  amount: string;
  price: string;
  priceValue: number; // For sorting
  total: string;
  timestamp: string;
  timestampValue: number; // For sorting
  trader: string;
};

export interface OrderBookCardProps {
  token: Token;
}

export function OrderBookCard({ token }: OrderBookCardProps) {
  const { params, setParams } = useQueryParams({ take: 10, skip: 0 });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);

  const { data, isLoading, isError } = useLimitOrdersByToken(token.token, token.chainId, {
    skip: params.skip,
    take: params.take,
  });

  const getOrderTokensInfo = useGetOrderTokensInfo();

  const columns: ColumnDef<LimitOrder>[] = [
    {
      id: 'offer',
      header: 'Offer',
      cell: ({ row }) => {
        const order = row.original;
        const { makeTokenInfo } = getOrderTokensInfo(order);

        return (
          <div className={cn('flex flex-col gap-0.5')}>
            <span className="text-sm font-medium">{formatTokenAmount(order.makeAmount, makeTokenInfo?.decimals)}</span>
            <span className="text-xs text-muted-foreground">{makeTokenInfo?.symbol}</span>
          </div>
        );
      },
    },
    {
      id: 'ask',
      header: 'Ask',
      cell: ({ row }) => {
        const order = row.original;
        const { takeTokenInfo } = getOrderTokensInfo(order);

        return (
          <div className={cn('flex flex-col gap-0.5')}>
            <span className="text-sm font-medium">{formatTokenAmount(order.takeAmount, takeTokenInfo?.decimals)}</span>
            <span className="text-xs text-muted-foreground">{takeTokenInfo?.symbol}</span>
          </div>
        );
      },
    },
    {
      id: 'price',
      header: ({ column }) => <DataTableColumnSortHeader column={column}>Price</DataTableColumnSortHeader>,
      cell: ({ row }) => {
        const order = row.original;
        const { _price } = getOrderTokensInfo(order);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{formatPrice(_price)}</span>
            <span className="text-xs text-muted-foreground"> ~ 1 {row.original.token?.symbol}</span>
          </div>
        );
      },
    },
    {
      id: 'status',
      accessorFn: (row) => row.status,
      header: ({ column }) => <DataTableColumnSortHeader column={column}>Status</DataTableColumnSortHeader>,
      cell: ({ row }) => {
        const order = row.original;
        const expirationDate = new Date(Number(order.expiration) * 1000);
        const isExpired = new Date() > expirationDate;
        return (
          <Badge variant={isExpired ? 'outline' : getStatusBadgeVariant(order.status)} className="capitalize">
            {isExpired ? 'Expired' : order.status}
          </Badge>
        );
      },
    },
    {
      id: 'createdAt',
      header: ({ column }) => <DataTableColumnSortHeader column={column}>Created At</DataTableColumnSortHeader>,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</span>
          </div>
        );
      },
    },
    {
      id: 'expiration',
      header: ({ column }) => <DataTableColumnSortHeader column={column}>Expired At</DataTableColumnSortHeader>,
      cell: ({ row }) => {
        const order = row.original;
        const expirationDate = new Date(Number(order.expiration) * 1000);
        return (
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{formatDateTime(expirationDate)}</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return <LimitOrderActions order={row.original} />;
      },
    },
  ];

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
        <CardTitle>Order Book</CardTitle>
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
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => {
                        const { isUserTokenMake } = getOrderTokensInfo(row.original);
                        const isSell = isUserTokenMake;

                        return (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                            className={cn(isSell ? 'bg-red-500/5' : 'bg-green-500/5')}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
