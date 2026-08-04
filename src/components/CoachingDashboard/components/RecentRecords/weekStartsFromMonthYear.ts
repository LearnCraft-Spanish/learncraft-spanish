/**
 * Converts a YYYY-MM month key into a Sunday week-start date (YYYY-MM-DD)
 * for seeding New*View student/week selectors on the coaching dashboard.
 */
export function weekStartsFromMonthYear(monthYear: string): string {
  const [year, month] = monthYear.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) {
    throw new Error(`Invalid monthYear: ${monthYear}. Expected YYYY-MM.`);
  }
  const date = new Date(year, month - 1, 1);
  date.setDate(date.getDate() - date.getDay());
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}
