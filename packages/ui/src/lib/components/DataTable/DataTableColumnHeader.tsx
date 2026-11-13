import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { Column, SortDirection } from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { Button } from '../ui/button';

export const ariaSort = (sorted: false | SortDirection) =>
  sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none';

function SortIcon({ sorted }: { sorted: false | SortDirection }) {
  const Icon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown;
  return <Icon aria-hidden="true" className={cn('size-3.5', !sorted && 'opacity-50')} />;
}

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  children: ReactNode;
}

/** A column title. It is a sort button when the column can sort, and plain text when not. */
export function DataTableColumnHeader<TData, TValue>({
  column,
  children,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) return <>{children}</>;
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1 px-2 data-[sorted=true]:text-foreground"
      data-sorted={sorted !== false}
      onClick={column.getToggleSortingHandler()}
    >
      {children}
      <SortIcon sorted={sorted} />
    </Button>
  );
}
