import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/badge';

const statusBadgeVariants = cva(
  'justify-self-center px-2 py-0.5 text-[10px] font-semibold uppercase',
  {
    variants: {
      status: {
        scheduled: 'bg-brand-50 text-brand-700 border-brand-200',
        live: 'bg-live text-live-foreground border-live-border animate-pulse',
        final: 'bg-neutral-200 text-neutral-800 border-neutral-300',
        postponed: 'bg-warning text-warning-foreground border-warning-border',
        canceled: 'bg-neutral-100 text-neutral-600 border-neutral-300',
      },
    },
    defaultVariants: { status: 'scheduled' },
  },
);

export type StatusBadgeStatus = NonNullable<VariantProps<typeof statusBadgeVariants>['status']>;

const DEFAULT_LABELS: Record<StatusBadgeStatus, string> = {
  scheduled: 'Scheduled',
  live: 'Live',
  final: 'Final',
  postponed: 'Postponed',
  canceled: 'Canceled',
};

export interface StatusBadgeProps extends Omit<ComponentProps<typeof Badge>, 'variant'> {
  status: StatusBadgeStatus;
}

/** A badge for the state of an event. Colors per status live here, not in callers. */
export function StatusBadge({ status, className, children, ...props }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusBadgeVariants({ status }), className)} {...props}>
      {children ?? DEFAULT_LABELS[status]}
    </Badge>
  );
}
