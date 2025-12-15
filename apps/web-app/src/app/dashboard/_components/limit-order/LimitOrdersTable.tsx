'use client';

import { LimitOrderType, type LimitOrder } from '@acme/client/services/limit-order/useCreateLimitOrder';
import { cn } from '@acme/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
import {
  OnChangeFn,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { useLimitOrderColumns } from '../../_hooks/useLimitOrderColumns';
import { LimitOrderExpandedRow } from './LimitOrderExpandedRow';

interface LimitOrdersTableProps {
  orders: LimitOrder[];
  defaultSorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  enableSorting?: boolean;
}

export function LimitOrdersTable({
  orders,
  defaultSorting = [],
  onSortingChange,
  enableSorting = true,
}: LimitOrdersTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const columns = useLimitOrderColumns({
    expandable: {
      expandedRows,
      toggleRowExpansion,
    },
    enableSorting,
  });

  const table = useReactTable<LimitOrder>({
    data: orders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && {
      onSortingChange: onSortingChange,
      getSortedRowModel: getSortedRowModel(),
      manualSorting: true, // Enable server-side sorting
      state: {
        sorting: defaultSorting,
      },
    }),
    getFilteredRowModel: getFilteredRowModel(),
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
                    className={cn(
                      ' border-0 bg-primary/5',
                      order.type === LimitOrderType.SELL ? 'bg-red-500/5' : 'bg-green-500/5'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
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
