'use client';

import { formatPrice, formatTokenAmount, getChainUIName } from '@acme/client/utils';
import { cn } from '@acme/ui';
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
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useLimitOrderTokens } from '~/services/1inche/useLimitOrderTokens';
import { type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';
import { formatDate, formatRelativeTime, getOrderInfo, getStatusBadgeVariant, getTokenDecimals, getTokenSymbol } from '../_utils/format-helpers';
import { LimitOrderActions } from './LimitOrderActions';
import { LimitOrderExpandedRow } from './LimitOrderExpandedRow';

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

        // Get token info for both tokens
        const makeTokenInfo = tokenMap.get(order.makeToken.toLowerCase());
        const takeTokenInfo = tokenMap.get(order.takeToken.toLowerCase());

        // Determine if user's token is makeToken or takeToken
        const isUserTokenMake = order.token && order.token.token.toLowerCase() === order.makeToken.toLowerCase();
        const isUserTokenTake = order.token && order.token.token.toLowerCase() === order.takeToken.toLowerCase();

        // Get symbols with fallbacks
        const makeTokenSymbol =
          makeTokenInfo?.symbol || (isUserTokenMake ? order.token?.symbol : null) || `${order.makeToken.slice(0, 6)}...${order.makeToken.slice(-4)}`;
        const takeTokenSymbol =
          takeTokenInfo?.symbol || (isUserTokenTake ? order.token?.symbol : null) || `${order.takeToken.slice(0, 6)}...${order.takeToken.slice(-4)}`;

        // Get token names
        const makeTokenName = makeTokenInfo?.name || (isUserTokenMake ? order.token?.name : null);
        const takeTokenName = takeTokenInfo?.name || (isUserTokenTake ? order.token?.name : null);

        // Get token address for navigation
        const tokenAddress = order.token?.token;

        // Display pair: makeToken/takeToken
        const pairContent = (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold">{makeTokenSymbol}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-semibold">{takeTokenSymbol}</span>
            </div>
            {(makeTokenName || takeTokenName) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {makeTokenName && <span>{makeTokenName}</span>}
                {makeTokenName && takeTokenName && <span>/</span>}
                {takeTokenName && <span>{takeTokenName}</span>}
              </div>
            )}
          </div>
        );

        // If we have a token address, make it clickable
        if (tokenAddress) {
          return (
            <Link href={`/dashboard/token/${tokenAddress}`} className="hover:text-primary hover:underline transition-colors cursor-pointer">
              {pairContent}
            </Link>
          );
        }

        return pairContent;
      },
      enableSorting: false,
    },
    {
      id: 'type',
      header: 'Type',
      accessorFn: (row) => {
        const info = getOrderInfo(row);
        return info.orderType || '';
      },
      cell: ({ row }) => {
        const info = getOrderInfo(row.original);
        if (!info.isOurToken) return <span className="text-xs text-muted-foreground">—</span>;

        const isSpell = info.orderType === 'SELL';
        return <Badge className={isSpell ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}>{info.orderType}</Badge>;
      },
    },
    {
      id: 'offer',
      header: 'Offer',
      cell: ({ row }) => {
        const order = row.original;
        const symbol = getTokenSymbol(order.makeToken, true, order, tokenMap);
        const decimals = getTokenDecimals(order.makeToken, order, tokenMap);

        const info = getOrderInfo(row.original);
        const isSpell = info.orderType === 'SELL';

        return (
          <div className={cn('flex flex-col gap-0.5', isSpell ? 'text-red-500' : 'text-green-500')}>
            <span className="text-sm font-medium">{formatTokenAmount(order.makeAmount, decimals)}</span>
            <span className="text-xs text-muted-foreground">{symbol}</span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'ask',
      header: 'Ask',
      cell: ({ row }) => {
        const order = row.original;
        const symbol = getTokenSymbol(order.takeToken, false, order, tokenMap);
        const decimals = getTokenDecimals(order.takeToken, order, tokenMap);

        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{formatTokenAmount(order.takeAmount, decimals)}</span>
            <span className="text-xs text-muted-foreground">{symbol}</span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'price',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
          Price
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      accessorFn: (row) => {
        try {
          const makeDecimals = getTokenDecimals(row.makeToken, row, tokenMap);
          const takeDecimals = getTokenDecimals(row.takeToken, row, tokenMap);
          const makeAmountNum = Number(row.makeAmount) / 10 ** makeDecimals;
          return makeAmountNum === 0 ? 0 : Number(row.takeAmount) / 10 ** takeDecimals / makeAmountNum;
        } catch {
          return 0;
        }
      },
      cell: ({ row }) => {
        try {
          const order = row.original;
          const makeDecimals = getTokenDecimals(order.makeToken, order, tokenMap);
          const takeDecimals = getTokenDecimals(order.takeToken, order, tokenMap);
          const makeAmountNum = Number(order.makeAmount) / 10 ** makeDecimals;
          if (makeAmountNum === 0) return <span className="text-xs text-muted-foreground">N/A</span>;

          const price = Number(order.takeAmount) / 10 ** takeDecimals / makeAmountNum;
          const makeSymbol = getTokenSymbol(order.makeToken, true, order, tokenMap);
          const takeSymbol = getTokenSymbol(order.takeToken, false, order, tokenMap);

          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{formatPrice(price)}</span>
              <span className="text-xs text-muted-foreground">
                {takeSymbol}/{makeSymbol}
              </span>
            </div>
          );
        } catch {
          return <span className="text-xs text-muted-foreground">N/A</span>;
        }
      },
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return <LimitOrderActions order={row.original} />;
      },
      enableSorting: false,
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
