export function formatEasternTime(iso: string, locale = 'en-US'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const formatted = new Intl.DateTimeFormat(locale, {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  return `${formatted} ET`;
}
