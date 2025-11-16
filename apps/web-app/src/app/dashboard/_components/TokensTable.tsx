'use client';

import { getChainUIName } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { Button } from '@acme/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
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
import { ArrowDown, ArrowUp, ArrowUpDown, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Token } from '~/services/token/useTrendingTokens';

interface TokensTableProps {
  tokens: Token[];
}

export function TokensTable({ tokens }: TokensTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Token>[] = [
    {
      id: 'pin',
      header: () => <div className="text-center">Pin</div>,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center  ">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Star />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'name',
      accessorFn: (row) => row.name,
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Name
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
        const token = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/token/${token.chainId}/${token.contractAddress}`}
              className="font-medium hover:text-primary hover:underline transition-colors cursor-pointer"
            >
              {token.name}
            </Link>
          </div>
        );
      },
    },
    {
      id: 'symbol',
      accessorFn: (row) => row.symbol,
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Symbol
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
        const token = row.original;
        return <Badge variant="outline">{token.symbol}</Badge>;
      },
    },
    {
      id: 'contractAddress',
      accessorFn: (row) => row.contractAddress,
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Contract Address
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
        const token = row.original;
        return <ExplorerLink hash={token.contractAddress} chainId={token.chainId} />;
      },
    },
    {
      id: 'chain',
      accessorFn: (row) => getChainUIName(row.chainId),
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
        const token = row.original;
        return <Badge variant="secondary">{getChainUIName(token.chainId)}</Badge>;
      },
    },
    {
      id: 'totalSupply',
      accessorFn: (row) => BigInt(row.totalSupply),
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Total Supply
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
        const token = row.original;
        return <span className="font-mono font-medium">{BigInt(token.totalSupply).toLocaleString('en-US')}</span>;
      },
    },
    {
      id: 'deployer',
      accessorFn: (row) => row.deployerAddress,
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8">
            Deployer
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
        const token = row.original;
        return <ExplorerLink hash={token.deployerAddress} chainId={token.chainId} />;
      },
    },
    {
      id: 'verified',
      accessorFn: (row) => (row.verifiedAt ? 'verified' : 'unverified'),
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
        const token = row.original;
        return token.verifiedAt ? (
          <Badge variant="default" className="text-xs">
            Verified
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Unverified
          </Badge>
        );
      },
    },
  ];

  const table = useReactTable<Token>({
    data: tokens || [],
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
      pagination: {
        pageIndex: 0,
        pageSize: 9,
      },
    },
  });

  return (
    <div>
      <div className="overflow-hidden ">
        <Table className="">
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
      <div className="flex items-center justify-end space-x-2 py-4 px-4 md:px-6 ">
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
  );
}
