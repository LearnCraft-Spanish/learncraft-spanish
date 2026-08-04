import type { FurnishedWeekWithCoach } from '@learncraft-spanish/shared';
import { getWeekStartsGoingBack } from '@domain/functions/assignmentsReportWeekStarts';

/** Wednesday (UTC day 3): on Wed–Sat show this week; Sun–Tue show last week. */
const INCOMPLETE_RECORDS_THIS_WEEK_FROM_DAY = 3;

/**
 * Returns the Sunday YYYY-MM-DD that should be used as the default
 * week-start for the IncompleteRecords section.
 *
 * Rule (matches legacy DateRangeProvider / useMyIncompleteWeeklyRecords):
 *   UTC day >= 3 (Wednesday–Saturday) → this week's Sunday
 *   UTC day < 3  (Sunday–Tuesday)     → last week's Sunday
 */
export function getDefaultIncompleteRecordsWeekStart(
  now: Date = new Date(),
): string {
  const dayOfWeek = now.getUTCDay();
  return getWeekStartsGoingBack(
    dayOfWeek >= INCOMPLETE_RECORDS_THIS_WEEK_FROM_DAY ? 0 : 1,
    now,
  );
}

/**
 * Filters a list of furnished weeks down to the ones a given coach still
 * needs to complete. Excludes hold weeks and 1-Month Challenge weeks.
 */
export function filterIncompleteWeeksForCoach(
  weeks: FurnishedWeekWithCoach[],
  coachId: number,
): FurnishedWeekWithCoach[] {
  return weeks.filter(
    (week) =>
      week.coach.coach_id === coachId &&
      !week.recordComplete &&
      !week.holdWeek &&
      week.srCourseName !== '1-Month Challenge',
  );
}
