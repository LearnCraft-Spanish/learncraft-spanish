import type { FurnishedWeekWithCoach } from '@learncraft-spanish/shared';
import {
  filterIncompleteWeeksForCoach,
  getDefaultIncompleteRecordsWeekStart,
} from '@domain/functions/incompleteWeeksForCoach';
import { createMockFurnishedWeekWithCoach } from '@testing/factories/weekFactory';
import { describe, expect, it } from 'vitest';

/** Build a UTC Date for a given YYYY-MM-DD at noon UTC. */
function utcDate(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00.000Z`);
}

describe('getDefaultIncompleteRecordsWeekStart', () => {
  it('returns last week Sunday on Sunday', () => {
    // 2026-07-12 is a Sunday (day 0)
    expect(getDefaultIncompleteRecordsWeekStart(utcDate('2026-07-12'))).toBe(
      '2026-07-05',
    );
  });

  it('returns last week Sunday on Monday', () => {
    expect(getDefaultIncompleteRecordsWeekStart(utcDate('2026-07-13'))).toBe(
      '2026-07-05',
    );
  });

  it('returns last week Sunday on Tuesday', () => {
    expect(getDefaultIncompleteRecordsWeekStart(utcDate('2026-07-14'))).toBe(
      '2026-07-05',
    );
  });

  it('returns this week Sunday on Wednesday', () => {
    // 2026-07-15 is a Wednesday (day 3) → threshold crossed → this week
    expect(getDefaultIncompleteRecordsWeekStart(utcDate('2026-07-15'))).toBe(
      '2026-07-12',
    );
  });

  it('returns this week Sunday on Thursday', () => {
    expect(getDefaultIncompleteRecordsWeekStart(utcDate('2026-07-16'))).toBe(
      '2026-07-12',
    );
  });

  it('returns this week Sunday on Saturday', () => {
    expect(getDefaultIncompleteRecordsWeekStart(utcDate('2026-07-18'))).toBe(
      '2026-07-12',
    );
  });
});

describe('filterIncompleteWeeksForCoach', () => {
  const coachId = 42;

  function makeWeek(
    overrides: Partial<FurnishedWeekWithCoach>,
  ): FurnishedWeekWithCoach {
    return createMockFurnishedWeekWithCoach({
      recordComplete: false,
      holdWeek: false,
      srCourseName: 'Spanish A1',
      coach: { coach_id: coachId, fullName: 'Coach A', email: 'coach@lcs.com' },
      ...overrides,
    });
  }

  it('returns incomplete weeks belonging to the given coach', () => {
    const week = makeWeek({});
    expect(filterIncompleteWeeksForCoach([week], coachId)).toHaveLength(1);
  });

  it('excludes weeks belonging to a different coach', () => {
    const week = makeWeek({
      coach: { coach_id: 99, fullName: 'Other', email: 'other@lcs.com' },
    });
    expect(filterIncompleteWeeksForCoach([week], coachId)).toHaveLength(0);
  });

  it('excludes complete weeks', () => {
    const week = makeWeek({ recordComplete: true });
    expect(filterIncompleteWeeksForCoach([week], coachId)).toHaveLength(0);
  });

  it('excludes hold weeks', () => {
    const week = makeWeek({ holdWeek: true });
    expect(filterIncompleteWeeksForCoach([week], coachId)).toHaveLength(0);
  });

  it('excludes 1-Month Challenge weeks', () => {
    const week = makeWeek({ srCourseName: '1-Month Challenge' });
    expect(filterIncompleteWeeksForCoach([week], coachId)).toHaveLength(0);
  });

  it('returns an empty array when given an empty list', () => {
    expect(filterIncompleteWeeksForCoach([], coachId)).toHaveLength(0);
  });

  it('filters a mixed list correctly', () => {
    const weeks = [
      makeWeek({}), // passes
      makeWeek({ recordComplete: true }), // excluded
      makeWeek({ holdWeek: true }), // excluded
      makeWeek({ srCourseName: '1-Month Challenge' }), // excluded
      makeWeek({
        coach: { coach_id: 99, fullName: 'Other', email: 'other@lcs.com' },
      }), // excluded — wrong coach
      makeWeek({}), // passes
    ];
    expect(filterIncompleteWeeksForCoach(weeks, coachId)).toHaveLength(2);
  });
});
