/**
 * Extracts a YYYY-MM month key from a date string or Date.
 * Used to decide whether a created coaching record belongs in a
 * cached recent-records month bucket.
 */
export function toYearMonth(date: string | Date): string {
  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) {
      throw new TypeError('Invalid Date');
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  // Prefer calendar date from YYYY-MM-DD (or ISO datetime) without timezone shift
  const dateOnlyMatch = /^(\d{4})-(\d{2})/.exec(date);
  if (dateOnlyMatch) {
    return `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}`;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new TypeError(`Invalid date: ${date}`);
  }
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
}
