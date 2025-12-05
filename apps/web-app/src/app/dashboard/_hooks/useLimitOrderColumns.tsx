'use client';

import { formatAddress, formatDateTime, formatPrice, formatTokenAmount, getChainUIName } from '@acme/client/utils';
import { cn } from '@acme/ui';
import { Badge } from '@acme/ui/badge';
import { DataTableColumnSortHeader } from '@acme/ui/bootstrapped/data-table-column-sort-header';
import { Button } from '@acme/ui/button';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useGetOrderTokensInfo } from '~/_hooks/useGetOrderTokensInfo';
import { getStatusBadgeVariant } from '~/_utils/getStatusBadgeVariant';
import { LimitOrderType, type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';
import { LimitOrderActions } from '../_components/limit-order/LimitOrderActions';

export interface UseLimitOrderColumnsProps {
  expandable?: {
    expandedRows: Record<string, boolean>;
    toggleRowExpansion: (rowId: string) => void;
  };
  filter?: Array<'pair' | 'type' | (string & {})>;
}

export const useLimitOrderColumns = (props: UseLimitOrderColumnsProps) => {
  const getOrderTokensInfo = useGetOrderTokensInfo();

  const { expandable } = props;

  const columns: ColumnDef<LimitOrder>[] = [
    ...(expandable
      ? [
          {
            id: 'expand',
            header: '',
            cell: ({ row }: CellContext<LimitOrder, unknown>) => {
              const order = row.original;
              const hasSeedData = order.token?.seedData?.data;
              if (!hasSeedData) {
                return null;
              }
              return (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => expandable.toggleRowExpansion(row.id)}
                >
                  {expandable.expandedRows[row.id] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              );
            },
          },
        ]
      : []),
    {
      id: 'pair',
      header: 'Pair',
      cell: ({ row }) => {
        const order = row.original;
        const { makeTokenInfo, takeTokenInfo } = getOrderTokensInfo(order);
        return (
          <Link
            href={`/dashboard/token/${order.token?.token}`}
            className="hover:text-primary transition-colors cursor-pointer"
          >
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
        return (
          <Badge className={isSell ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}>
            {isSell ? 'SELL' : 'BUY'}
          </Badge>
        );
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
            <span className="text-sm font-medium">
              {formatTokenAmount(order.makeAmount, makeTokenInfo?.decimals)}
            </span>
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
            <span className="text-sm font-medium">
              {formatTokenAmount(order.takeAmount, takeTokenInfo?.decimals)}
            </span>
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

  return columns.filter((el) => (props.filter ? !!!props.filter?.includes(el.id ?? '') : true));
};
