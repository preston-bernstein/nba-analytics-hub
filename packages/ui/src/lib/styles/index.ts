/**
 * Shared Tailwind CSS class patterns for consistent styling across components.
 * Light, neutral theme with calm contrast and soft surfaces.
 */

/** Base button style for secondary/navigation buttons */
export const buttonSecondary =
  'rounded-md border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm hover:bg-neutral-100 hover:text-neutral-900 transition-colors';

/** Muted variant of secondary button (for less prominent actions) */
export const buttonSecondaryMuted =
  'rounded-md border border-border bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 transition-colors';

/** Disabled variant of secondary button */
export const buttonSecondaryDisabled =
  'rounded-md border border-border bg-neutral-100/60 px-3 py-1.5 text-sm font-semibold text-neutral-400 cursor-not-allowed';

/** Base card container with border and shadow */
export const cardContainer =
  'rounded-lg border border-border bg-card p-3 text-sm text-foreground shadow-sm';

/** Card container variant with padding 4 instead of 3 */
export const cardContainerLg =
  'rounded-lg border border-border bg-card p-4 shadow-sm';

/** Base status badge styling */
export const statusBadge =
  'rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide';

/** Team row base styling */
export const teamRow = 'flex items-center justify-between rounded-md px-3 py-2';

/** Team row default background */
export const teamRowDefault = 'bg-neutral-100';

/** Team row winner highlight */
export const teamRowWinner = 'bg-emerald-50 border border-emerald-200';
