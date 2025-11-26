export function formatDateTime(iso: string, locale = 'en-US') {
  return new Date(iso).toLocaleString(locale, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
