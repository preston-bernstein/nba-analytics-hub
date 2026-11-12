export interface TeamScoreProps {
  name: string;
  score?: number;
  isWinner?: boolean;
  showScore?: boolean;
}

function getInitials(name: string): string {
  const [first = '', ...rest] = name.trim().split(/\s+/);
  return `${first[0] ?? ''}${rest.at(-1)?.[0] ?? ''}`.toUpperCase();
}

/** A team's initials badge, name, and optional score, stacked in a column. */
export function TeamScore({ name, score, isWinner = false, showScore = false }: TeamScoreProps) {
  const emphasis = isWinner ? 'text-emerald-700' : 'text-foreground';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-500 sm:text-base">
        {getInitials(name)}
      </div>
      <span className={`text-sm font-semibold sm:text-base ${emphasis}`}>{name}</span>
      {showScore && score !== undefined && (
        <span className={`text-2xl font-bold sm:text-3xl ${emphasis}`}>{score}</span>
      )}
    </div>
  );
}
