import { useCallback, useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  type ColumnDef,
  type RowData,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { DataTableColumnHeader, ariaSort } from './DataTableColumnHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

declare module '@tanstack/react-table' {
  // The generics must match the library's declaration, so they look unused here.
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'left' | 'right';
  }
}

/** How close to the bottom, in pixels, the scroll must be before the next page loads. */
const END_THRESHOLD = 200;

export interface DataTableProps<TData, TValue> extends VariantProps<typeof dataTableVariants> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** The server sorts the rows. The table only shows which column is sorted. */
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  getRowId?: (row: TData) => string;
  /** True while the server has more rows. */
  hasMore?: boolean;
  isFetching?: boolean;
  /** Called when the user scrolls near the bottom, or the rows do not fill the table. */
  onEndReached?: () => void;
  emptyMessage?: string;
  className?: string;
}

const dataTableVariants = cva(
  'max-h-[70vh] overflow-auto rounded-md border [&_[data-slot=table-container]]:overflow-visible',
  {
    variants: {
      density: {
        default: '',
        compact: '[&_th]:h-8 [&_td]:py-1 [&_td]:text-[13px]',
      },
    },
    defaultVariants: { density: 'default' },
  }
);

export function DataTable<TData, TValue>({
  columns,
  data,
  sorting,
  onSortingChange,
  getRowId,
  hasMore = false,
  isFetching = false,
  onEndReached,
  emptyMessage = 'No results.',
  density = 'default',
  className,
}: DataTableProps<TData, TValue>) {
  // TanStack Table returns functions that React Compiler cannot memoize. The table is not memoized.
  // oxlint-disable-next-line react/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getRowId,
    manualSorting: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
    onSortingChange: (updater) =>
      onSortingChange(typeof updater === 'function' ? updater(sorting) : updater),
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMoreIfNeeded = useCallback(
    (filled: boolean) => {
      const el = scrollRef.current;
      if (!el || !hasMore || isFetching || !onEndReached) return;
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      // On mount, a table that has not been laid out yet has no height. Wait for it.
      if (filled ? distance < END_THRESHOLD : el.scrollHeight > 0 && distance <= 0) {
        onEndReached();
      }
    },
    [hasMore, isFetching, onEndReached]
  );

  // When the rows do not fill the table there is nothing to scroll, so load the next page.
  useEffect(() => loadMoreIfNeeded(false), [loadMoreIfNeeded, data.length]);

  const rows = table.getRowModel().rows;
  const columnCount = table.getVisibleLeafColumns().length;

  return (
    <div
      ref={scrollRef}
      data-slot="data-table-scroll"
      data-density={density}
      onScroll={() => loadMoreIfNeeded(true)}
      className={cn(dataTableVariants({ density }), className)}
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_var(--border)]">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => {
                const { column } = header;
                const content = flexRender(column.columnDef.header, header.getContext());
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={ariaSort(column.getIsSorted())}
                    className={cn(column.columnDef.meta?.align === 'right' && 'text-right')}
                  >
                    <DataTableColumnHeader column={column}>{content}</DataTableColumnHeader>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    cell.column.columnDef.meta?.align === 'right' && 'text-right tabular-nums'
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {rows.length === 0 && !isFetching ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : null}
          {isFetching && rows.length > 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                <output>Loading…</output>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
