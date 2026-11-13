import { useId } from 'react';
import { SEASON_TYPES, SEASON_TYPE_LABELS } from '@nba-analytics-hub/players';
import type { SeasonType } from '@nba-analytics-hub/players';
import { Card, CardContent, Input, NativeSelect, cn } from '@nba-analytics-hub/ui';

const fieldClass = 'flex flex-col gap-1.5 text-sm font-medium';

interface LeaderboardFiltersProps {
  season: number;
  seasonType: SeasonType;
  search: string;
  /** The seasons to pick from, newest first. */
  seasons: number[];
  onSeasonChange: (season: number) => void;
  onSeasonTypeChange: (seasonType: SeasonType) => void;
  onSearchChange: (search: string) => void;
}

const seasonLabel = (year: number) => `${year}-${String(year + 1).slice(2)}`;

export function LeaderboardFilters({
  season,
  seasonType,
  search,
  seasons,
  onSeasonChange,
  onSeasonTypeChange,
  onSearchChange,
}: LeaderboardFiltersProps) {
  const ids = { season: useId(), seasonType: useId(), search: useId() };

  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-4">
        <div className={fieldClass}>
          <label htmlFor={ids.season}>Season</label>
          <NativeSelect
            id={ids.season}
            value={season}
            onChange={(e) => onSeasonChange(Number(e.target.value))}
          >
            {seasons.map((year) => (
              <option key={year} value={year}>
                {seasonLabel(year)}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className={fieldClass}>
          <label htmlFor={ids.seasonType}>Season type</label>
          <NativeSelect
            id={ids.seasonType}
            value={seasonType}
            onChange={(e) => onSeasonTypeChange(e.target.value as SeasonType)}
          >
            {SEASON_TYPES.map((type) => (
              <option key={type} value={type}>
                {SEASON_TYPE_LABELS[type]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className={cn(fieldClass, 'min-w-48 flex-1')}>
          <label htmlFor={ids.search}>Search players</label>
          <Input
            id={ids.search}
            type="search"
            value={search}
            placeholder="Search by name"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
