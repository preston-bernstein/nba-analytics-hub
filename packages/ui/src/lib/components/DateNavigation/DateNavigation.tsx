import { buttonSecondary, buttonSecondaryMuted } from '../../styles';

export interface DateNavigationProps {
  displayDate: string;
  showTodayButton: boolean;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function DateNavigation({
  displayDate,
  showTodayButton,
  onPreviousDay,
  onNextDay,
  onToday,
}: DateNavigationProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPreviousDay}
        className={buttonSecondary}
        aria-label="Previous day"
      >
        ←
      </button>

      <span className="min-w-[120px] text-center text-lg font-medium text-gray-200">
        {displayDate}
      </span>

      <button
        onClick={onNextDay}
        className={buttonSecondary}
        aria-label="Next day"
      >
        →
      </button>

      {showTodayButton && (
        <button onClick={onToday} className={`ml-2 ${buttonSecondaryMuted}`}>
          Today
        </button>
      )}
    </div>
  );
}
