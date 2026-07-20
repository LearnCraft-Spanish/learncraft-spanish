import {
  getDefaultAssignmentsReportWeekStarts,
  getWeekStartsGoingBack,
  getWeekStartsOptions,
} from '@domain/functions/assignmentsReportWeekStarts';
import { describe, expect, it } from 'vitest';

/** Build a UTC Date for a given YYYY-MM-DD at noon UTC. */
function utcDate(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00.000Z`);
}

describe('getWeekStartsGoingBack', () => {
  it('returns this week Sunday when weeksAgo is 0', () => {
    // Wednesday 2026-07-15 → week starts Sunday 2026-07-12
    expect(getWeekStartsGoingBack(0, utcDate('2026-07-15'))).toBe('2026-07-12');
  });

  it('returns last week Sunday when weeksAgo is 1', () => {
    expect(getWeekStartsGoingBack(1, utcDate('2026-07-15'))).toBe('2026-07-05');
  });
});

describe('getDefaultAssignmentsReportWeekStarts', () => {
  it('returns last week on Sunday through Wednesday', () => {
    expect(getDefaultAssignmentsReportWeekStarts(utcDate('2026-07-12'))).toBe(
      '2026-07-05',
    ); // Sunday
    expect(getDefaultAssignmentsReportWeekStarts(utcDate('2026-07-13'))).toBe(
      '2026-07-05',
    ); // Monday
    expect(getDefaultAssignmentsReportWeekStarts(utcDate('2026-07-14'))).toBe(
      '2026-07-05',
    ); // Tuesday
    expect(getDefaultAssignmentsReportWeekStarts(utcDate('2026-07-15'))).toBe(
      '2026-07-05',
    ); // Wednesday
  });

  it('returns this week on Thursday through Saturday', () => {
    expect(getDefaultAssignmentsReportWeekStarts(utcDate('2026-07-16'))).toBe(
      '2026-07-12',
    ); // Thursday
    expect(getDefaultAssignmentsReportWeekStarts(utcDate('2026-07-17'))).toBe(
      '2026-07-12',
    ); // Friday
    expect(getDefaultAssignmentsReportWeekStarts(utcDate('2026-07-18'))).toBe(
      '2026-07-12',
    ); // Saturday
  });
});

describe('getWeekStartsOptions', () => {
  it('returns labeled options going back the requested number of weeks', () => {
    const options = getWeekStartsOptions(3, utcDate('2026-07-16'));

    expect(options).toEqual([
      { weekStarts: '2026-07-12', label: 'This Week (July 12)' },
      { weekStarts: '2026-07-05', label: 'Last Week (July 5)' },
      { weekStarts: '2026-06-28', label: 'Two Weeks Ago (June 28)' },
    ]);
  });
});
