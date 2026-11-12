import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { LEADERBOARD_PAGE_SIZE } from '@nba-analytics-hub/players';
import type { LeaderboardRow } from '@nba-analytics-hub/players';
import { renderWithQueryClient } from '../../test-utils/renderWithQueryClient';
import { LeaderboardPage } from './LeaderboardPage';
import { usePlayersStore } from './hooks/usePlayersStore';

const PAGE_SIZE = LEADERBOARD_PAGE_SIZE.default;

const row = (i: number): LeaderboardRow => ({
  playerId: i,
  name: `Player ${i}`,
  position: 'G',
  gp: 60,
  min: 30.2,
  pts: 25.04 - i / 10,
  reb: 5,
  ast: 4,
  stl: 1,
  blk: 0.5,
  tov: 2,
  fgPct: 0.5,
  fg3Pct: 0.4,
  ftPct: 0.8,
  plusMinus: 2.5,
  fantasyPts: 40,
});

const all = Array.from({ length: PAGE_SIZE + 20 }, (_, i) => row(i + 1));
const requests: URL[] = [];

const server = setupServer(
  http.get('*/players/leaderboard', ({ request }) => {
    const url = new URL(request.url);
    requests.push(url);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const limit = Number(url.searchParams.get('limit') ?? PAGE_SIZE);
    return HttpResponse.json({
      rows: all.slice(offset, offset + limit),
      total: all.length,
      limit,
      offset,
    });
  })
);

beforeAll(() => server.listen());
beforeEach(() => {
  requests.length = 0;
  usePlayersStore.setState(usePlayersStore.getInitialState(), true);
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('LeaderboardPage', () => {
  it('shows the first page of players with formatted stats', async () => {
    renderWithQueryClient(<LeaderboardPage />);
    expect(await screen.findByText('Player 1')).toBeInTheDocument();
    const first = screen.getByText('Player 1').closest('tr') as HTMLElement;
    expect(within(first).getByText('24.9')).toBeInTheDocument();
    expect(within(first).getByText('50.0%')).toBeInTheDocument();
    expect(within(first).getByText('+2.5')).toBeInTheDocument();
    expect(requests[0].searchParams.get('offset')).toBe('0');
    expect(requests[0].searchParams.get('limit')).toBe(String(PAGE_SIZE));
    expect(requests[0].searchParams.get('sort')).toBe('pts');
    expect(requests[0].searchParams.get('dir')).toBe('desc');
  });

  it('shows how many players match', async () => {
    renderWithQueryClient(<LeaderboardPage />);
    expect(await screen.findByText(/70 players/i)).toBeInTheDocument();
  });

  it('asks the server to sort when a header is clicked', async () => {
    renderWithQueryClient(<LeaderboardPage />);
    await screen.findByText('Player 1');
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
    await screen.findByText('Player 1');
    const el = container.querySelector('[data-slot="data-table-scroll"]') as HTMLElement;
    Object.defineProperty(el, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
    Object.defineProperty(el, 'scrollTop', { value: 600, configurable: true });
    fireEvent.scroll(el);
    expect(await screen.findByText(`Player ${PAGE_SIZE + 1}`)).toBeInTheDocument();
    expect(requests.at(-1)?.searchParams.get('offset')).toBe(String(PAGE_SIZE));
  });

  it('reloads from the first page when the season changes', async () => {
    renderWithQueryClient(<LeaderboardPage />);
    await screen.findByText('Player 1');
    fireEvent.change(screen.getByLabelText('Season'), { target: { value: '2019' } });
    await waitFor(() => expect(requests.at(-1)?.searchParams.get('season')).toBe('2019'));
    expect(requests.at(-1)?.searchParams.get('offset')).toBe('0');
  });

  it('reloads when the season type changes', async () => {
    renderWithQueryClient(<LeaderboardPage />);
    await screen.findByText('Player 1');
    fireEvent.change(screen.getByLabelText('Season type'), { target: { value: 'playoffs' } });
    await waitFor(() => expect(requests.at(-1)?.searchParams.get('seasonType')).toBe('playoffs'));
  });

  it('searches on the server after the user stops typing', async () => {
    renderWithQueryClient(<LeaderboardPage />);
    await screen.findByText('Player 1');
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
