'use client';

import { formatAddress, formatDateTime, formatPrice, formatTokenAmount, getChainUIName } from '@acme/client/utils';
import { LimitOrderType } from '@acme/db';
import { cn } from '@acme/ui';
import { Badge } from '@acme/ui/badge';
import { DataTableColumnSortHeader } from '@acme/ui/bootstrapped/data-table-column-sort-header';
import { Button } from '@acme/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useGetOrderTokensInfo } from '~/_hooks/useGetOrderTokensInfo';
import { type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';
import { getStatusBadgeVariant } from '../../../../_utils/getStatusBadgeVariant';
import { LimitOrderActions } from './LimitOrderActions';
import { LimitOrderExpandedRow } from './LimitOrderExpandedRow';

interface LimitOrdersTableProps {
  orders: LimitOrder[];
}

export function LimitOrdersTable({ orders }: LimitOrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const getOrderTokensInfo = useGetOrderTokensInfo();

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const columns: ColumnDef<LimitOrder>[] = [
    {
      id: 'expand',
      header: '',
      cell: ({ row }) => {
        const order = row.original;
        const hasSeedData = order.token?.seedData?.data;
        if (!hasSeedData) {
          return null;
        }
        return (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleRowExpansion(row.id)}>
            {expandedRows[row.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        );
      },
    },
    {
      id: 'pair',
      header: 'Pair',
      cell: ({ row }) => {
        const order = row.original;
        const { makeTokenInfo, takeTokenInfo } = getOrderTokensInfo(order);
        return (
          <Link href={`/dashboard/token/${order.token?.token}`} className="hover:text-primary transition-colors cursor-pointer">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold">{makeTokenInfo?.symbol ?? '_'}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-semibold">{takeTokenInfo?.symbol ?? '_'}</span>
                <Badge variant="secondary">{getChainUIName(order.chainId)}</Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{makeTokenInfo?.name ?? formatAddress(order.makeToken)}</span>/
                <span>{takeTokenInfo?.name ?? formatAddress(order.takeToken)}</span>
              </div>
            </div>
          </Link>
        );
      },
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const isSell = row.original.type === LimitOrderType.SELL;
        return <Badge className={isSell ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}>{isSell ? 'SELL' : 'BUY'}</Badge>;
      },
    },
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
        return (
          <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
            {order.status}
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
      header: ({ column }) => <DataTableColumnSortHeader column={column}>expire At</DataTableColumnSortHeader>,
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
      enableSorting: false,
    },
  ];

  const table = useReactTable<LimitOrder>({
    data: orders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Use server-side pagination
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className=" rounded-md border  ">
      <Table wrapperClassName=" max-h-[65vh] relative overflow-auto">
        <TableHeader className="sticky top-0 bg-background z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const order = row.original;
              const isExpanded = expandedRows[row.id];
              const seedData = order.token?.seedData?.data;

              return (
                <>
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className=" border-0 bg-primary/5">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                  {seedData && (
                    <LimitOrderExpandedRow
                      key={`${row.id}-expanded`}
                      order={order}
                      colSpan={columns.length}
                      seedData={seedData}
                      isExpanded={!!isExpanded}
                    />
                  )}
                </>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
