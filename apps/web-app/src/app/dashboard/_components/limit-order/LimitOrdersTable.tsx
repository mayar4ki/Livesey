'use client';

import { cn } from '@acme/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useState } from 'react';
import { LimitOrderType, type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';
import { useLimitOrderColimns } from '../../_hooks/useLimitOrderColimns';
import { LimitOrderExpandedRow } from './LimitOrderExpandedRow';

interface LimitOrdersTableProps {
  orders: LimitOrder[];
}

export function LimitOrdersTable({ orders }: LimitOrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const columns = useLimitOrderColimns({
    expandable: {
      expandedRows, toggleRowExpansion
    }
  })

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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(' border-0 bg-primary/5', order.type === LimitOrderType.SELL ? 'bg-red-500/5' : 'bg-green-500/5')}
                  >
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
