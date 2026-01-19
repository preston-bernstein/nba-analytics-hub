import { DateNavigation, formatDisplayDate } from '@nba-analytics-hub/ui';
import { isToday } from '@nba-analytics-hub/domain';

interface DashboardEmptyStateProps {
  selectedDate: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function DashboardEmptyState({
  selectedDate,
  onPreviousDay,
  onNextDay,
  onToday,
}: DashboardEmptyStateProps) {
  return (
    <section aria-label="Dashboard empty state" className="p-6">
      {/* Date Navigation */}
      <div className="mb-6">
        <DateNavigation
          displayDate={formatDisplayDate(selectedDate)}
          showTodayButton={!isToday(selectedDate)}
          onPreviousDay={onPreviousDay}
          onNextDay={onNextDay}
          onToday={onToday}
        />
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-700 bg-gray-900/50 py-16">
        {/* Basketball icon using unicode */}
        <div className="mb-4 text-5xl text-gray-600" aria-hidden="true">
          &#127936;
        </div>
        <h2 className="text-xl font-semibold text-gray-300">No games scheduled</h2>
        <p className="mt-2 text-sm text-gray-500">
          Try a different date to find games.
        </p>
      </div>
    </section>
  );
}
