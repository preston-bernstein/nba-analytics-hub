import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { DataTableColumnHeader } from './DataTableColumnHeader';

interface Row {
  a: number;
}

function Harness({
  sorting,
  onSortingChange,
  enableSorting = true,
}: {
  sorting: SortingState;
  onSortingChange: (s: SortingState) => void;
  enableSorting?: boolean;
}) {
  const columns: ColumnDef<Row>[] = [{ id: 'a', accessorKey: 'a', header: 'A', enableSorting }];
  // oxlint-disable-next-line react/incompatible-library
  const table = useReactTable({
    data: [],
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    enableSortingRemoval: false,
    onSortingChange: (u) => onSortingChange(typeof u === 'function' ? u(sorting) : u),
  });
  const column = table.getColumn('a')!;
  return <DataTableColumnHeader column={column}>Title</DataTableColumnHeader>;
}

describe('DataTableColumnHeader', () => {
  it('shows a sort button that toggles the sort', () => {
    const onSortingChange = vi.fn();
    render(<Harness sorting={[{ id: 'a', desc: false }]} onSortingChange={onSortingChange} />);
    const button = screen.getByRole('button', { name: 'Title' });
    expect(button).toHaveAttribute('data-sorted', 'true');
    fireEvent.click(button);
    expect(onSortingChange).toHaveBeenCalledWith([{ id: 'a', desc: true }]);
  });

  it('marks an unsorted column', () => {
    render(<Harness sorting={[]} onSortingChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Title' })).toHaveAttribute('data-sorted', 'false');
  });

  it('shows plain text, with no button, when the column cannot sort', () => {
    render(<Harness sorting={[]} onSortingChange={vi.fn()} enableSorting={false} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Title')).toBeInTheDocument();
  });
});
