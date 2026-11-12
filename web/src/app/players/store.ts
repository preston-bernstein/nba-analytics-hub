import { create } from 'zustand';
import type { SortDir } from '@nba-analytics-hub/platform';
import type { LeaderboardColumnKey, SeasonType } from '@nba-analytics-hub/players';
import { defaultSeason } from './seasons';

// Only what the user picks lives here. The rows live in the TanStack Query cache.
export interface PlayersState {
  season: number;
  seasonType: SeasonType;
  search: string;
  sort: LeaderboardColumnKey;
  dir: SortDir;
  setSeason: (season: number) => void;
  setSeasonType: (seasonType: SeasonType) => void;
  setSearch: (search: string) => void;
  setSort: (sort: LeaderboardColumnKey, dir: SortDir) => void;
}

export const usePlayersStore = create<PlayersState>()((set) => ({
  season: defaultSeason(),
  seasonType: 'regular',
  search: '',
  sort: 'pts',
  dir: 'desc',
  setSeason: (season) => set({ season }),
  setSeasonType: (seasonType) => set({ seasonType }),
  setSearch: (search) => set({ search }),
  setSort: (sort, dir) => set({ sort, dir }),
}));
