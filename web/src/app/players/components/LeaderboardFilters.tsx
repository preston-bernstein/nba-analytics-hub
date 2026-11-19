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

interface SelectFieldProps<T extends string | number> {
  id: string;
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (raw: string) => void;
}

function SelectField<T extends string | number>({
  id,
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  return (
    <div className={fieldClass}>
      <label htmlFor={id}>{label}</label>
      <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

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
        <SelectField
          id={ids.season}
          label="Season"
          value={season}
          options={seasons.map((year) => ({ value: year, label: seasonLabel(year) }))}
          onChange={(raw) => onSeasonChange(Number(raw))}
        />
        <SelectField
          id={ids.seasonType}
          label="Season type"
          value={seasonType}
          options={SEASON_TYPES.map((type) => ({ value: type, label: SEASON_TYPE_LABELS[type] }))}
          onChange={(raw) => onSeasonTypeChange(raw as SeasonType)}
        />
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
