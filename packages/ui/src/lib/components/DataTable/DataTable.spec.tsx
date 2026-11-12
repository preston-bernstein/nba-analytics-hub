import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { DataTable } from './DataTable';

interface Row {
  id: string;
  name: string;
  pts: number;
}

const columns: ColumnDef<Row>[] = [
  { id: 'name', accessorKey: 'name', header: 'Player', sortDescFirst: false },
  {
    id: 'pts',
    accessorKey: 'pts',
    header: 'PTS',
    sortDescFirst: true,
    meta: { align: 'right' },
  },
  { id: 'note', header: 'Note', enableSorting: false, cell: () => 'n/a' },
];

const data: Row[] = [
  { id: 'a', name: 'Ann', pts: 30 },
  { id: 'b', name: 'Bo', pts: 20 },
];

function setup(props: Partial<React.ComponentProps<typeof DataTable<Row, unknown>>> = {}) {
  const onSortingChange = vi.fn();
  const onEndReached = vi.fn();
  const utils = render(
    <DataTable<Row, unknown>
      columns={columns}
      data={data}
      sorting={[{ id: 'pts', desc: true }]}
      onSortingChange={onSortingChange}
      onEndReached={onEndReached}
      hasMore
      getRowId={(row) => row.id}
      {...props}
    />
  );
  return { ...utils, onSortingChange, onEndReached };
}

function scroller(container: HTMLElement) {
  return container.querySelector('[data-slot="data-table-scroll"]') as HTMLElement;
}

function size(el: HTMLElement, { scrollHeight, clientHeight, scrollTop }: Record<string, number>) {
  Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true });
  Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
  Object.defineProperty(el, 'scrollTop', { value: scrollTop, configurable: true });
}

afterEach(() => vi.restoreAllMocks());

describe('DataTable', () => {
  it('renders headers and rows through the shadcn Table', () => {
    const { container } = setup();
    expect(container.querySelector('[data-slot="table"]')).not.toBeNull();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Ann')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getAllByText('n/a')).toHaveLength(2);
  });

  it('marks the sorted column with aria-sort and the others as none', () => {
    setup();
    expect(screen.getByRole('columnheader', { name: /PTS/ })).toHaveAttribute(
      'aria-sort',
      'descending'
    );
    expect(screen.getByRole('columnheader', { name: /Player/ })).toHaveAttribute(
      'aria-sort',
      'none'
    );
  });

  it('only sortable columns have a sort button', () => {
    setup();
    expect(screen.getByRole('button', { name: /Player/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Note/ })).toBeNull();
  });

  it('flips the direction when the sorted column is clicked', () => {
    const { onSortingChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /PTS/ }));
    expect(onSortingChange).toHaveBeenCalledWith([
      { id: 'pts', desc: false },
    ] satisfies SortingState);
  });

  it('starts a new column in its first direction, replacing the old sort', () => {
    const { onSortingChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Player/ }));
    expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: false }]);
  });

  it('does not sort rows itself, because the server sorts', () => {
    setup({ sorting: [{ id: 'name', desc: false }], data: [data[1], data[0]] });
    const cells = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => r.textContent);
    expect(cells[0]).toMatch(/Bo/);
  });

  it('asks for more rows when scrolled near the bottom', () => {
    const { container, onEndReached } = setup();
    const el = scroller(container);
    size(el, { scrollHeight: 1000, clientHeight: 400, scrollTop: 450 });
    fireEvent.scroll(el);
    expect(onEndReached).toHaveBeenCalledTimes(1);
  });

  it('does not ask for more when far from the bottom', () => {
    const { container, onEndReached } = setup();
    const el = scroller(container);
    size(el, { scrollHeight: 2000, clientHeight: 400, scrollTop: 100 });
    fireEvent.scroll(el);
    expect(onEndReached).not.toHaveBeenCalled();
  });

  it('does not ask for more when there is no more, or a fetch is running', () => {
    const none = setup({ hasMore: false });
    size(scroller(none.container), { scrollHeight: 1000, clientHeight: 400, scrollTop: 600 });
    fireEvent.scroll(scroller(none.container));
    expect(none.onEndReached).not.toHaveBeenCalled();

    const busy = setup({ isFetching: true });
    size(scroller(busy.container), { scrollHeight: 1000, clientHeight: 400, scrollTop: 600 });
    fireEvent.scroll(scroller(busy.container));
    expect(busy.onEndReached).not.toHaveBeenCalled();
  });

  it('asks for more on mount when the rows do not fill the container', () => {
    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(100);
    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(400);
    const { onEndReached } = setup();
    expect(onEndReached).toHaveBeenCalledTimes(1);
  });

  it('shows a loading row while it fetches more', () => {
    setup({ isFetching: true });
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
  });

  it('shows the empty message when there are no rows', () => {
    setup({ data: [], hasMore: false, emptyMessage: 'No players found' });
    expect(screen.getByText('No players found')).toBeInTheDocument();
  });
});
