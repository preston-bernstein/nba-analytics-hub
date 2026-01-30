import { DashboardErrorStateProps } from '../types';

export function DashboardErrorState({ message }: DashboardErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-rose-800"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl" role="img" aria-label="warning">⚠️</span>
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  );
}
