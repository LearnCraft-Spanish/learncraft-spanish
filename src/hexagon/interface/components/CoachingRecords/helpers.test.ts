import type { AttendeeSelection } from '@interface/components/CoachingRecords/helpers';
import {
  formatDateInput,
  formatDateInputWithDefault,
  getSortedWeekIds,
  getWeekStartsFromDate,
  hasSameAttendeeWeekIds,
  remapAttendeesByName,
  subtractWeeks,
  toShortReadableMonthDay,
} from '@interface/components/CoachingRecords/helpers';
import { createMockFurnishedWeekWithCoach } from '@testing/factories/weekFactory';
import { afterEach, describe, expect, it, vi } from 'vitest';

function attendee(weekId: number, studentFullName = 'Name'): AttendeeSelection {
  return { weekId, studentFullName };
}

function weekFor(weekId: number, fullName: string) {
  const base = createMockFurnishedWeekWithCoach();
  return createMockFurnishedWeekWithCoach({
    weekId,
    student: { ...base.student, fullName },
  });
}

describe('formatDateInput', () => {
  it.each([null, undefined, ''])(
    'returns an empty string for a missing date (%j)',
    (value) => {
      expect(formatDateInput(value)).toBe('');
    },
  );

  it('keeps only the calendar date of an ISO datetime string', () => {
    expect(formatDateInput('2026-03-15T14:30:00.000Z')).toBe('2026-03-15');
  });

  it('returns a YYYY-MM-DD string unchanged', () => {
    expect(formatDateInput('2026-03-15')).toBe('2026-03-15');
  });

  it('formats a Date as YYYY-MM-DD', () => {
    expect(formatDateInput(new Date('2026-03-15T12:00:00.000Z'))).toBe(
      '2026-03-15',
    );
  });
});

describe('formatDateInputWithDefault', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to today's date when no date is given", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T12:00:00.000Z'));

    expect(formatDateInputWithDefault(null)).toBe('2026-06-10');
    expect(formatDateInputWithDefault(undefined)).toBe('2026-06-10');
    expect(formatDateInputWithDefault('')).toBe('2026-06-10');
  });

  it('formats a provided date instead of using the default', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T12:00:00.000Z'));

    expect(formatDateInputWithDefault('2026-03-15T14:30:00.000Z')).toBe(
      '2026-03-15',
    );
    expect(formatDateInputWithDefault(new Date('2026-03-15T12:00:00Z'))).toBe(
      '2026-03-15',
    );
  });
});

describe('subtractWeeks', () => {
  it('moves the date back by whole weeks', () => {
    expect(subtractWeeks('2026-01-19', 1)).toBe('2026-01-12');
    expect(subtractWeeks('2026-01-19', 3)).toBe('2025-12-29');
  });

  it('returns the same date when subtracting zero weeks', () => {
    expect(subtractWeeks('2026-01-19', 0)).toBe('2026-01-19');
  });

  it('crosses month and year boundaries', () => {
    expect(subtractWeeks('2026-03-02', 1)).toBe('2026-02-23');
    expect(subtractWeeks('2026-01-05', 2)).toBe('2025-12-22');
  });

  it('respects leap days', () => {
    expect(subtractWeeks('2024-03-07', 1)).toBe('2024-02-29');
  });

  it('zero-pads month and day', () => {
    expect(subtractWeeks('2026-10-12', 5)).toBe('2026-09-07');
    expect(subtractWeeks('2026-02-09', 1)).toBe('2026-02-02');
  });
});

describe('toShortReadableMonthDay', () => {
  it('formats as an abbreviated month and day', () => {
    expect(toShortReadableMonthDay('2026-03-15')).toBe('Mar 15');
    expect(toShortReadableMonthDay('2026-12-01')).toBe('Dec 1');
  });
});

describe('getWeekStartsFromDate', () => {
  it('returns the same date when it is already a Sunday', () => {
    // 2026-01-04 is a Sunday
    expect(getWeekStartsFromDate('2026-01-04')).toBe('2026-01-04');
  });

  it('returns the preceding Sunday for a midweek date', () => {
    // 2026-01-07 is a Wednesday
    expect(getWeekStartsFromDate('2026-01-07')).toBe('2026-01-04');
  });

  it('treats Saturday as the last day of the week', () => {
    // 2026-01-10 is a Saturday
    expect(getWeekStartsFromDate('2026-01-10')).toBe('2026-01-04');
  });

  it('can land in the previous month or year', () => {
    // 2026-04-01 is a Wednesday; 2026-01-01 is a Thursday
    expect(getWeekStartsFromDate('2026-04-01')).toBe('2026-03-29');
    expect(getWeekStartsFromDate('2026-01-01')).toBe('2025-12-28');
  });
});

describe('getSortedWeekIds', () => {
  it('returns week ids in ascending numeric order', () => {
    expect(
      getSortedWeekIds([attendee(10), attendee(9), attendee(100)]),
    ).toEqual([9, 10, 100]);
  });

  it('returns an empty list when there are no attendees', () => {
    expect(getSortedWeekIds([])).toEqual([]);
  });

  it('does not reorder the attendees passed in', () => {
    const attendees = [attendee(3), attendee(1), attendee(2)];

    getSortedWeekIds(attendees);

    expect(attendees.map((a) => a.weekId)).toEqual([3, 1, 2]);
  });
});

describe('remapAttendeesByName', () => {
  const weeks = [
    weekFor(1, 'Ana García'),
    weekFor(2, 'Ben Ortiz'),
    weekFor(3, 'Cleo Díaz'),
  ];

  it('maps each attendee name to the matching week', () => {
    expect(remapAttendeesByName(['Ben Ortiz', 'Ana García'], weeks)).toEqual([
      { weekId: 2, studentFullName: 'Ben Ortiz' },
      { weekId: 1, studentFullName: 'Ana García' },
    ]);
  });

  it('matches names regardless of case and surrounding whitespace', () => {
    expect(
      remapAttendeesByName(['  ana garcía  ', 'BEN ORTIZ'], weeks),
    ).toEqual([
      { weekId: 1, studentFullName: 'Ana García' },
      { weekId: 2, studentFullName: 'Ben Ortiz' },
    ]);
  });

  it('drops names that have no matching week', () => {
    expect(remapAttendeesByName(['Ana García', 'Nobody Here'], weeks)).toEqual([
      { weekId: 1, studentFullName: 'Ana García' },
    ]);
  });

  it('returns an empty list when nothing matches or there are no names', () => {
    expect(remapAttendeesByName(['Nobody Here'], weeks)).toEqual([]);
    expect(remapAttendeesByName([], weeks)).toEqual([]);
    expect(remapAttendeesByName(['Ana García'], [])).toEqual([]);
  });
});

describe('hasSameAttendeeWeekIds', () => {
  it('is true when the attendees cover exactly the original week ids', () => {
    expect(
      hasSameAttendeeWeekIds(
        [attendee(1), attendee(2), attendee(3)],
        [1, 2, 3],
      ),
    ).toBe(true);
  });

  it('ignores ordering', () => {
    expect(
      hasSameAttendeeWeekIds(
        [attendee(3), attendee(1), attendee(2)],
        [2, 3, 1],
      ),
    ).toBe(true);
  });

  it('is true when both are empty', () => {
    expect(hasSameAttendeeWeekIds([], [])).toBe(true);
  });

  it('is false when an attendee was added', () => {
    expect(hasSameAttendeeWeekIds([attendee(1), attendee(2)], [1])).toBe(false);
  });

  it('is false when an attendee was removed', () => {
    expect(hasSameAttendeeWeekIds([attendee(1)], [1, 2])).toBe(false);
  });

  it('is false when an attendee was swapped for a different week', () => {
    expect(hasSameAttendeeWeekIds([attendee(1), attendee(4)], [1, 2])).toBe(
      false,
    );
  });

  it('does not reorder the original week ids passed in', () => {
    const originalWeekIds = [3, 1, 2];

    hasSameAttendeeWeekIds(
      [attendee(1), attendee(2), attendee(3)],
      originalWeekIds,
    );

    expect(originalWeekIds).toEqual([3, 1, 2]);
  });
});
