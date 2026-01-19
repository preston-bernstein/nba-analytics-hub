/**
 * Shared Tailwind CSS class patterns for consistent styling across components.
 * Import these constants instead of duplicating class strings.
 */

/** Base button style for secondary/navigation buttons */
export const buttonSecondary =
  'rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100';

/** Muted variant of secondary button (for less prominent actions) */
export const buttonSecondaryMuted =
  'rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-700 hover:text-gray-100';

/** Base card container with border and shadow */
export const cardContainer =
  'rounded-md border border-gray-700 bg-gray-900 p-3 text-sm shadow-sm';

/** Card container variant with padding 4 instead of 3 */
export const cardContainerLg =
  'rounded-md border border-gray-700 bg-gray-900 p-4 shadow-sm';

/** Base status badge styling */
export const statusBadge = 'rounded px-2 py-0.5 text-xs font-semibold';

/** Team row base styling */
export const teamRow = 'flex items-center justify-between rounded px-2 py-1.5';

/** Team row default background */
export const teamRowDefault = 'bg-gray-800/50';

/** Team row winner highlight */
export const teamRowWinner = 'bg-green-900/30 border border-green-800';
