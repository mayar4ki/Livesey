'use client';

import { formatAddress, formatTokenBalance, getChainUIName } from '@acme/shared/utils';
import { Badge } from '@acme/ui/badge';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Coins, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { Button } from '@acme/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
import { useWalletAssets, type Token } from '~/services/token/useWalletAssets';

export default function Page() {
  const chainId = useChainId();
  const { address: walletAddress, isConnected } = useAccount();
  const { data, isLoading, error } = useWalletAssets(walletAddress, chainId);
  const allAssets = data?.data?.data?.tokens || [];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Token>[] = [
    {
      id: 'token',
      accessorFn: (row) => row.tokenMetadata?.name || row.tokenMetadata?.symbol || 'Unknown Token',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Token
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
        const asset = row.original;
        const contractAddress = asset.tokenAddress || asset.address;
        return (
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/token/${chainId}/${contractAddress}`}
              className="font-medium hover:text-primary hover:underline transition-colors cursor-pointer"
            >
              {asset.tokenMetadata?.name || asset.tokenMetadata?.symbol || 'Unknown Token'}
            </Link>
            {asset.tokenMetadata?.symbol && asset.tokenMetadata?.name && (
              <Badge variant="outline" className="text-xs">
                {asset.tokenMetadata.symbol}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: 'balance',
      accessorFn: (row) => {
        const balance = BigInt(row.tokenBalance || '0');
        const decimals = row.tokenMetadata?.decimals || 18;
        return Number(balance) / Math.pow(10, decimals);
      },
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Balance
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
        const asset = row.original;
        return <span className="font-mono font-medium">{formatTokenBalance(asset.tokenBalance || '0', asset.tokenMetadata?.decimals || 18)}</span>;
      },
    },
    {
      id: 'contractAddress',
      accessorFn: (row) => row.tokenAddress || row.address,
      header: 'Contract Address',
      cell: ({ row }) => {
        const asset = row.original;
        const contractAddress = asset.tokenAddress || asset.address;
        return <ExplorerLink hash={contractAddress} chainId={chainId} />;
      },
    },
    {
      id: 'chain',
      header: 'Chain',
      cell: () => <Badge variant="secondary">{getChainUIName(chainId)}</Badge>,
    },
  ];

  const table = useReactTable<Token>({
    data: allAssets || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  if (!isConnected || !walletAddress) {
    return <ErrorStateCard icon={Wallet} title="Wallet Not Connected" message="Please connect your wallet to view your assets" />;
  }

  if (error) {
    return (
      <ErrorStateCard icon={Wallet} title="Error Loading Assets" message={error instanceof Error ? error.message : 'Failed to load wallet assets'} />
    );
  }

  if (isLoading) {
    return <LoadingCard message={`Loading assets for ${formatAddress(walletAddress)}...`} />;
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            My Assets
          </CardTitle>
          <CardDescription>
            View all ERC-20 tokens in your wallet on {getChainUIName(chainId)}
            {walletAddress && ` (${formatAddress(walletAddress)})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
              <p className="text-sm text-muted-foreground text-center">
                You don't have any ERC-20 tokens in this wallet on {getChainUIName(chainId)}.
              </p>
            </div>
          ) : (
            <div>
              <div className="overflow-hidden rounded-md border">
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
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    Previous
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
