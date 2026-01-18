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
        className="rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
        aria-label="Previous day"
      >
        ←
      </button>

      <span className="min-w-[120px] text-center text-lg font-medium text-gray-200">
        {displayDate}
      </span>

      <button
        onClick={onNextDay}
        className="rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
        aria-label="Next day"
      >
        →
      </button>

      {showTodayButton && (
        <button
          onClick={onToday}
          className="ml-2 rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-700 hover:text-gray-100"
        >
          Today
        </button>
      )}
    </div>
  );
}
