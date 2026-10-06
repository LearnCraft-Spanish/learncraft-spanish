import type { CoachCapacityReportRow } from '@learncraft-spanish/shared';
import {
  formatBookedPercent,
  formatCoachCapacityHours,
  mapCoachCapacityRowToTableRow,
  NOT_SET_DISPLAY,
  sortCoachCapacityRows,
} from '@domain/functions/coachCapacity';
import {
  createMockCoachCapacityReportRow,
  createMockCoachCapacitySettings,
} from '@testing/factories/adminReportsFactory';
import { describe, expect, it } from 'vitest';

function coachRow(
  fullName: string,
  desiredHours: number | null,
  bookedPercent: number | null,
): CoachCapacityReportRow {
  return createMockCoachCapacityReportRow({
    coach: { coach_id: fullName.length, fullName, email: 'coach@example.test' },
    settings: createMockCoachCapacitySettings({ desiredHours }),
    bookedPercent,
  });
}

function names(rows: CoachCapacityReportRow[]): string[] {
  return rows.map((row) => row.coach.fullName);
}

describe('sortCoachCapacityRows', () => {
  it('puts coaches with no Desired Hours first, then Booked % ascending', () => {
    const rows = [
      coachRow('Booked Eighty', 20, 80),
      coachRow('Not Set Up', null, null),
      coachRow('Booked Ten', 20, 10),
      coachRow('Zero Desired', 0, null),
      coachRow('Booked Fifty', 20, 50.5),
    ];

    expect(names(sortCoachCapacityRows(rows))).toEqual([
      'Not Set Up',
      'Zero Desired',
      'Booked Ten',
      'Booked Fifty',
      'Booked Eighty',
    ]);
  });

  it('breaks Booked % ties by coach name', () => {
    const rows = [
      coachRow('Carla', 10, 40),
      coachRow('Ana', 10, 40),
      coachRow('Beto', 10, 40),
    ];

    expect(names(sortCoachCapacityRows(rows))).toEqual([
      'Ana',
      'Beto',
      'Carla',
    ]);
  });

  it('sorts coaches without Desired Hours by name', () => {
    const rows = [coachRow('Zoe', null, null), coachRow('Ana', null, null)];

    expect(names(sortCoachCapacityRows(rows))).toEqual(['Ana', 'Zoe']);
  });

  it('keeps a coach without Desired Hours ahead of a 0% booked coach', () => {
    const rows = [coachRow('Aaron', 10, 0), coachRow('Zoe', null, null)];

    expect(names(sortCoachCapacityRows(rows))).toEqual(['Zoe', 'Aaron']);
  });

  it('does not reorder the rows it was given', () => {
    const rows = [coachRow('Second', 10, 90), coachRow('First', 10, 10)];

    sortCoachCapacityRows(rows);

    expect(names(rows)).toEqual(['Second', 'First']);
  });
});

describe('formatCoachCapacityHours', () => {
  it('shows hours with 2 decimal places', () => {
    expect(formatCoachCapacityHours(1.5)).toBe('1.50');
    expect(formatCoachCapacityHours(0)).toBe('0.00');
    expect(formatCoachCapacityHours(12.3456)).toBe('12.35');
  });

  it('shows a dash when the hours are not set', () => {
    expect(formatCoachCapacityHours(null)).toBe(NOT_SET_DISPLAY);
  });
});

describe('formatBookedPercent', () => {
  it('shows a whole number with a percent sign', () => {
    expect(formatBookedPercent(52.1)).toBe('52%');
    expect(formatBookedPercent(52.5)).toBe('53%');
    expect(formatBookedPercent(0)).toBe('0%');
    expect(formatBookedPercent(125)).toBe('125%');
  });

  it('shows a dash for coaches who are not set up', () => {
    expect(formatBookedPercent(null)).toBe('—');
  });
});

describe('mapCoachCapacityRowToTableRow', () => {
  it('maps every report column to its display value, keyed by coach', () => {
    const row = createMockCoachCapacityReportRow({
      coach: { coach_id: 42, fullName: 'Coach Ana', email: 'ana@example.test' },
      settings: {
        groupSessionsPerWeek: 3,
        projectsHours: 2.25,
        internalTimeHours: 1,
        teamMeetingHours: 0.5,
        desiredHours: 20,
        notes: 'Prefers mornings',
      },
      coachingHours: 9.3333,
      committedHours: 14.0833,
      bookedPercent: 70.4165,
    });

    expect(mapCoachCapacityRowToTableRow(row)).toEqual({
      id: '42',
      cells: {
        coach: 'Coach Ana',
        coachingHours: '9.33',
        groupSessionsPerWeek: '3',
        projectsHours: '2.25',
        internalTimeHours: '1.00',
        teamMeetingHours: '0.50',
        committedHours: '14.08',
        desiredHours: '20.00',
        bookedPercent: '70%',
        notes: 'Prefers mornings',
      },
    });
  });

  it('shows dashes for Desired Hours and Booked % when a coach is not set up', () => {
    const row = createMockCoachCapacityReportRow({
      settings: createMockCoachCapacitySettings({ desiredHours: null }),
      bookedPercent: null,
    });

    const { cells } = mapCoachCapacityRowToTableRow(row);

    expect(cells.desiredHours).toBe('—');
    expect(cells.bookedPercent).toBe('—');
  });
});
