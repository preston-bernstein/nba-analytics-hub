import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { LEADERBOARD_PAGE_SIZE } from '@nba-analytics-hub/players';
import { renderWithQueryClient } from '../../test-utils/renderWithQueryClient';
import { makeLeaderboard } from '../../mocks/data/leaderboard';
import { server } from '../../mocks/server';
import { LeaderboardPage } from './LeaderboardPage';
import { usePlayersStore } from './hooks/usePlayersStore';

const PAGE_SIZE = LEADERBOARD_PAGE_SIZE.default;
const requests: URL[] = [];

// What the shared mock handler returns for the default view: points, high to low.
const initial = usePlayersStore.getInitialState();
const byPoints = makeLeaderboard(initial.season, initial.seasonType).toSorted(
  (a, b) => (b.pts ?? 0) - (a.pts ?? 0) || a.playerId - b.playerId
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  requests.length = 0;
  usePlayersStore.setState(usePlayersStore.getInitialState(), true);
  server.events.on('request:start', ({ request }) => requests.push(new URL(request.url)));
});
afterEach(() => {
  server.events.removeAllListeners();
  server.resetHandlers();
});
afterAll(() => server.close());

describe('LeaderboardPage', () => {
  it('shows the first page of players with formatted stats', async () => {
    renderWithQueryClient(<LeaderboardPage />);
    const top = byPoints[0];
    expect(await screen.findByText(top.name)).toBeInTheDocument();
    const first = screen.getByText(top.name).closest('tr') as HTMLElement;
    expect(within(first).getByText((top.pts as number).toFixed(1))).toBeInTheDocument();
    expect(within(first).getAllByRole('cell')).toHaveLength(15);
    expect(requests[0].searchParams.get('offset')).toBe('0');
    expect(requests[0].searchParams.get('limit')).toBe(String(PAGE_SIZE));
    expect(requests[0].searchParams.get('sort')).toBe('pts');
    expect(requests[0].searchParams.get('dir')).toBe('desc');
  });

  it('shows how many players match', async () => {
    renderWithQueryClient(<LeaderboardPage />);
    expect(await screen.findByText(`${byPoints.length} players`)).toBeInTheDocument();
  });

  it('asks the server to sort when a header is clicked', async () => {
    renderWithQueryClient(<LeaderboardPage />);
    await screen.findByText(byPoints[0].name);
    fireEvent.click(screen.getByRole('button', { name: /^Player/ }));
    await waitFor(() => {
      const last = requests.at(-1) as URL;
      expect(last.searchParams.get('sort')).toBe('name');
      expect(last.searchParams.get('dir')).toBe('asc');
      expect(last.searchParams.get('offset')).toBe('0');
    });
    expect(screen.getByRole('columnheader', { name: /^Player/ })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );
  });

  it('asks for the next page when the table is scrolled to the bottom', async () => {
    const { container } = renderWithQueryClient(<LeaderboardPage />);
    await screen.findByText(byPoints[0].name);
    const el = container.querySelector('[data-slot="data-table-scroll"]') as HTMLElement;
    Object.defineProperty(el, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
    // 50px from the bottom: close enough to load more, but the table still looks full.
    Object.defineProperty(el, 'scrollTop', { value: 550, configurable: true });
    fireEvent.scroll(el);
    expect(await screen.findByText(byPoints[PAGE_SIZE].name)).toBeInTheDocument();
    expect(requests.map((r) => r.searchParams.get('offset'))).toEqual(['0', String(PAGE_SIZE)]);
  });

  it('reloads from the first page when the season changes', async () => {
    renderWithQueryClient(<LeaderboardPage />);
    await screen.findByText(byPoints[0].name);
    fireEvent.change(screen.getByLabelText('Season'), { target: { value: '2019' } });
    await waitFor(() => expect(requests.at(-1)?.searchParams.get('season')).toBe('2019'));
    expect(requests.at(-1)?.searchParams.get('offset')).toBe('0');
  });

  it('reloads when the season type changes', async () => {
    renderWithQueryClient(<LeaderboardPage />);
    await screen.findByText(byPoints[0].name);
    fireEvent.change(screen.getByLabelText('Season type'), { target: { value: 'playoffs' } });
    await waitFor(() => expect(requests.at(-1)?.searchParams.get('seasonType')).toBe('playoffs'));
  });

  it('searches on the server after the user stops typing', async () => {
    renderWithQueryClient(<LeaderboardPage />);
    await screen.findByText(byPoints[0].name);
    fireEvent.change(screen.getByLabelText('Search players'), { target: { value: 'ann' } });
    await waitFor(() => expect(requests.at(-1)?.searchParams.get('search')).toBe('ann'), {
      timeout: 2000,
    });
    const searches = requests.map((r) => r.searchParams.get('search'));
    expect(searches.filter((s) => s === 'a' || s === 'an')).toHaveLength(0);
  });

  it('shows an error when the API fails', async () => {
    server.use(http.get('*/players/leaderboard', () => new HttpResponse(null, { status: 502 })));
    renderWithQueryClient(<LeaderboardPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to load/i);
  });

  it('shows a message when no player matches', async () => {
    server.use(
      http.get('*/players/leaderboard', () =>
        HttpResponse.json({ rows: [], total: 0, limit: PAGE_SIZE, offset: 0 })
      )
    );
    renderWithQueryClient(<LeaderboardPage />);
    expect(await screen.findByText(/no players found/i)).toBeInTheDocument();
  });
});
