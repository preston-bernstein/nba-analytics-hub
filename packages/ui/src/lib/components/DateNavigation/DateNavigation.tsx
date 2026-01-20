import {
  buttonSecondary,
  buttonSecondaryDisabled,
  buttonSecondaryMuted,
} from '../../styles';

export interface DateNavigationProps {
  displayDate: string;
  showTodayButton: boolean;
  disablePrevious?: boolean;
  disableNext?: boolean;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function DateNavigation({
  displayDate,
  showTodayButton,
  disablePrevious = false,
  disableNext = false,
  onPreviousDay,
  onNextDay,
  onToday,
}: DateNavigationProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPreviousDay}
        disabled={disablePrevious}
        className={disablePrevious ? buttonSecondaryDisabled : buttonSecondary}
        aria-label="Previous day"
      >
        ←
      </button>

      <span className="min-w-[140px] text-center text-lg font-semibold text-foreground">
        {displayDate}
      </span>

      <button
        onClick={onNextDay}
        disabled={disableNext}
        className={disableNext ? buttonSecondaryDisabled : buttonSecondary}
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
