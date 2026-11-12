import { beforeEach } from 'vitest';
import { usePlayersStore } from './store';

beforeEach(() => usePlayersStore.setState(usePlayersStore.getInitialState(), true));

describe('players store', () => {
  it('starts on the last finished regular season, sorted by points', () => {
    const s = usePlayersStore.getState();
    expect(s).toMatchObject({ seasonType: 'regular', search: '', sort: 'pts', dir: 'desc' });
    expect(s.season).toBeGreaterThanOrEqual(2025);
  });

  it('sets the season and the season type', () => {
    usePlayersStore.getState().setSeason(2019);
    usePlayersStore.getState().setSeasonType('playoffs');
    expect(usePlayersStore.getState()).toMatchObject({ season: 2019, seasonType: 'playoffs' });
  });

  it('sets the search text', () => {
    usePlayersStore.getState().setSearch('lebron');
    expect(usePlayersStore.getState().search).toBe('lebron');
  });

  it('sets the sort column and direction together', () => {
    usePlayersStore.getState().setSort('name', 'asc');
    expect(usePlayersStore.getState()).toMatchObject({ sort: 'name', dir: 'asc' });
  });
});
