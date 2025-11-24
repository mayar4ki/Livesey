'use client';

import { Button } from '@acme/ui/button';
import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import * as React from 'react';

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  children: React.ReactNode;
  className?: string;
};

/**
 * Reusable sortable column header component for data tables
 */
export function DataTableColumnSortHeader<TData, TValue>({ column, children, className }: DataTableColumnHeaderProps<TData, TValue>) {
  return (
    <Button variant="ghost" onClick={() => column.toggleSorting()} className={className || 'h-8'}>
      {children}
      {column.getIsSorted() === 'asc' ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}
