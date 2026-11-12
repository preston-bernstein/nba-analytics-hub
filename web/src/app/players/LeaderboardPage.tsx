import { LeaderboardFilters } from './components/LeaderboardFilters';
import { LeaderboardTable } from './components/LeaderboardTable';
import { usePlayersStore } from './hooks/usePlayersStore';
import { seasonOptions } from './lib/seasons';

const SEASONS = seasonOptions();

export function LeaderboardPage() {
  const { season, seasonType, search, setSeason, setSeasonType, setSearch } = usePlayersStore();

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Player leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Season averages from BALLDONTLIE. Click a column to sort it. The server sorts and pages
          the rows.
        </p>
      </div>
      <LeaderboardFilters
        season={season}
        seasonType={seasonType}
        search={search}
        seasons={SEASONS}
        onSeasonChange={setSeason}
        onSeasonTypeChange={setSeasonType}
        onSearchChange={setSearch}
      />
      <LeaderboardTable />
    </section>
  );
}
