'use client';

import { formatPrice, formatTokenAmount, getChainUIName } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
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
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLimitOrderTokens } from '~/services/1inche/useLimitOrderTokens';
import { type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';
import { getOurTokenDecimals } from '~/utils/token-decimals';
import { LimitOrderExpandedRow } from './LimitOrderExpandedRow';

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  return formatDate(d);
}

function getStatusBadgeVariant(status: LimitOrder['status']) {
  switch (status) {
    case 'pending':
      return 'default';
    case 'filled':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'expired':
      return 'outline';
    default:
      return 'secondary';
  }
}

interface LimitOrdersTableProps {
  orders: LimitOrder[];
}

export function LimitOrdersTable({ orders }: LimitOrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const { tokens: baseTokens } = useLimitOrderTokens();

  // Create a map of token addresses to token info for quick lookup
  const tokenMap = useMemo(() => {
    const map = new Map<string, { name: string; symbol: string; decimals: number }>();
    baseTokens.forEach((token) => {
      map.set(token.address.toLowerCase(), {
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
      });
    });
    return map;
  }, [baseTokens]);

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
      enableSorting: false,
      size: 50,
    },
    {
      id: 'pair',
      header: 'Pair',
      cell: ({ row }) => {
        const order = row.original;

        // Determine if this is a sell or buy order by matching token with makeToken or takeToken
        const isSellOrder = order.token && order.token.token.toLowerCase() === order.makeToken.toLowerCase();
        const isBuyOrder = order.token && order.token.token.toLowerCase() === order.takeToken.toLowerCase();

        // Get user's token info (from order.token)
        const userTokenSymbol =
          order.token?.symbol ||
          (isSellOrder
            ? `${order.makeToken.slice(0, 6)}...${order.makeToken.slice(-4)}`
            : `${order.takeToken.slice(0, 6)}...${order.takeToken.slice(-4)}`);
        const userTokenName = order.token?.name;

        // Get the other token info from baseTokens list
        const otherTokenAddress = isSellOrder ? order.takeToken : isBuyOrder ? order.makeToken : null;
        const otherTokenInfo = otherTokenAddress ? tokenMap.get(otherTokenAddress.toLowerCase()) : null;
        const otherTokenSymbol =
          otherTokenInfo?.symbol || (otherTokenAddress ? `${otherTokenAddress.slice(0, 6)}...${otherTokenAddress.slice(-4)}` : '');
        const otherTokenName = otherTokenInfo?.name;

        // Get the amount being sold/bought (the amount of the user's token)
        const userTokenAmount = isSellOrder ? order.makeAmount : isBuyOrder ? order.takeAmount : null;
        const otherTokenAmount = isSellOrder ? order.takeAmount : isBuyOrder ? order.makeAmount : null;

        // Decimals: our token from env var, other token from baseTokens list
        const userTokenDecimals = getOurTokenDecimals();
        const otherTokenDecimals = otherTokenInfo?.decimals || 18;

        if (!userTokenAmount || !otherTokenAmount) {
          // Fallback if we can't determine sell/buy
          const makeTokenSymbol =
            order.token && order.token.token.toLowerCase() === order.makeToken.toLowerCase()
              ? order.token.symbol
              : `${order.makeToken.slice(0, 6)}...${order.makeToken.slice(-4)}`;
          const takeTokenSymbol =
            order.token && order.token.token.toLowerCase() === order.takeToken.toLowerCase()
              ? order.token.symbol
              : `${order.takeToken.slice(0, 6)}...${order.takeToken.slice(-4)}`;

          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-xs font-medium px-2 py-0.5">
                  {makeTokenSymbol}
                </Badge>
                <span className="text-muted-foreground text-xs">→</span>
                <Badge variant="outline" className="text-xs font-medium px-2 py-0.5">
                  {takeTokenSymbol}
                </Badge>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={isSellOrder ? 'destructive' : 'default'} className="text-xs font-medium px-2 py-0.5">
                {isSellOrder ? 'Sell' : 'Buy'}
              </Badge>
              <span className="text-sm font-medium">
                {formatTokenAmount(userTokenAmount, userTokenDecimals)} {userTokenSymbol}
              </span>
              {userTokenName && <span className="text-xs text-muted-foreground">({userTokenName})</span>}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span>for</span>
              <span className="font-medium">
                {formatTokenAmount(otherTokenAmount, otherTokenDecimals)} {otherTokenSymbol}
              </span>
              {otherTokenName && <span className="text-muted-foreground">({otherTokenName})</span>}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'makeAmount',
      accessorFn: (row) => BigInt(row.makeAmount),
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Make Amount
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const order = row.original;
        return <span className="font-mono text-sm">{formatTokenAmount(order.makeAmount)}</span>;
      },
    },
    {
      id: 'takeAmount',
      accessorFn: (row) => BigInt(row.takeAmount),
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Take Amount
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const order = row.original;
        return <span className="font-mono text-sm">{formatTokenAmount(order.takeAmount)}</span>;
      },
    },
    {
      id: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const order = row.original;
        try {
          const makeAmount = BigInt(order.makeAmount);
          const takeAmount = BigInt(order.takeAmount);
          if (makeAmount === BigInt(0)) {
            return <span className="text-sm text-muted-foreground">N/A</span>;
          }
          // Price = takeAmount / makeAmount (how much you get per unit you sell)
          const price = Number(takeAmount) / Number(makeAmount);
          return <span className="font-mono text-sm">{formatPrice(price)}</span>;
        } catch {
          return <span className="text-sm text-muted-foreground">N/A</span>;
        }
      },
      enableSorting: false,
    },
    {
      id: 'status',
      accessorFn: (row) => row.status,
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Status
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
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
      id: 'chainId',
      accessorFn: (row) => row.chainId,
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Chain
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const order = row.original;
        return <Badge variant="secondary">{getChainUIName(order.chainId)}</Badge>;
      },
    },
    {
      id: 'createdAt',
      accessorFn: (row) => new Date(row.createdAt).getTime(),
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Created
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-col">
            <span className="text-sm">{formatRelativeTime(order.createdAt)}</span>
            <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
          </div>
        );
      },
    },
    {
      id: 'expiration',
      accessorFn: (row) => {
        try {
          return Number(row.expiration) * 1000; // Convert Unix timestamp to milliseconds
        } catch {
          return 0;
        }
      },
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Expires
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const order = row.original;
        try {
          const expirationTimestamp = Number(order.expiration) * 1000;
          const expirationDate = new Date(expirationTimestamp);
          const now = new Date();
          const isExpired = expirationDate < now;

          return (
            <div className="flex flex-col">
              <span className={`text-sm ${isExpired ? 'text-destructive' : ''}`}>{isExpired ? 'Expired' : formatRelativeTime(expirationDate)}</span>
              <span className="text-xs text-muted-foreground">{formatDate(expirationDate)}</span>
            </div>
          );
        } catch {
          return <span className="text-sm text-muted-foreground">N/A</span>;
        }
      },
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
    <div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
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
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                    {isExpanded && seedData && (
                      <LimitOrderExpandedRow key={`${row.id}-expanded`} order={order} colSpan={columns.length} seedData={seedData} />
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
    </div>
  );
}
