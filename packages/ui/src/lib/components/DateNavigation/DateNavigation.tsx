import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

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
      <Button
        variant="outline"
        size="icon"
        onClick={onPreviousDay}
        disabled={disablePrevious}
        aria-label="Previous day"
      >
        <ChevronLeft />
      </Button>

      <span className="min-w-[140px] text-center text-lg font-semibold text-foreground">
        {displayDate}
      </span>

      <Button
        variant="outline"
        size="icon"
        onClick={onNextDay}
        disabled={disableNext}
        aria-label="Next day"
      >
        <ChevronRight />
      </Button>

      {showTodayButton && (
        <Button variant="secondary" className="ml-2" onClick={onToday}>
          Today
        </Button>
      )}
    </div>
  );
}
