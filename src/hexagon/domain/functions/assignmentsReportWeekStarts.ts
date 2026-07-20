import { toReadableMonthDay } from '@domain/functions/dateUtils';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

/** Thursday–Saturday use this week's data; Sunday–Wednesday use last week's. */
const THIS_WEEK_FROM_DAY = 4; // Thursday (UTC)

export interface WeekStartsOption {
  weekStarts: string;
  label: string;
}

/**
 * Returns the Sunday (UTC, YYYY-MM-DD) that starts the week `weeksAgo` weeks before `now`.
 * weeksAgo 0 = this week's Sunday, 1 = last week's Sunday, etc.
 */
export function getWeekStartsGoingBack(
  weeksAgo: number,
  now: Date = new Date(),
): string {
  const dayOfWeek = now.getUTCDay();
  return new Date(
    now.getTime() - dayOfWeek * MS_PER_DAY - weeksAgo * MS_PER_WEEK,
  )
    .toISOString()
    .split('T')[0];
}

/**
 * Default weekStarts for the assignments-completed-by-week report:
 * - Sunday–Wednesday → last week's Sunday
 * - Thursday–Saturday → this week's Sunday
 */
export function getDefaultAssignmentsReportWeekStarts(
  now: Date = new Date(),
): string {
  const dayOfWeek = now.getUTCDay();
  return getWeekStartsGoingBack(dayOfWeek >= THIS_WEEK_FROM_DAY ? 0 : 1, now);
}

export function getWeekStartsOptions(
  numWeeks: number,
  now: Date = new Date(),
): WeekStartsOption[] {
  return Array.from({ length: numWeeks }, (_, weeksAgo) => {
    const weekStarts = getWeekStartsGoingBack(weeksAgo, now);
    const readable = toReadableMonthDay(weekStarts);
    const label =
      weeksAgo === 0
        ? `This Week (${readable})`
        : weeksAgo === 1
          ? `Last Week (${readable})`
          : weeksAgo === 2
            ? `Two Weeks Ago (${readable})`
            : readable;

    return { weekStarts, label };
  });
}
