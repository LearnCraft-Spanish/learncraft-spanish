import type { CoachCapacityReportRow } from '@learncraft-spanish/shared';
import {
  formatBookedPercent,
  formatCoachCapacityHours,
  mapCoachCapacityRowToTableRow,
  NOT_SET_DISPLAY,
  parseCoachCapacitySettingsCells,
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

  it('leaves Desired Hours empty and shows a dash for Booked % when a coach is not set up', () => {
    const row = createMockCoachCapacityReportRow({
      settings: createMockCoachCapacitySettings({ desiredHours: null }),
      bookedPercent: null,
    });

    const { cells } = mapCoachCapacityRowToTableRow(row);

    expect(cells.desiredHours).toBe('');
    expect(cells.bookedPercent).toBe('—');
  });
});

describe('parseCoachCapacitySettingsCells', () => {
  const validCells = {
    groupSessionsPerWeek: '2',
    projectsHours: '1.25',
    internalTimeHours: '0.50',
    teamMeetingHours: '1',
    desiredHours: '20.00',
  };

  it('reads full settings from the cells, with the notes supplied', () => {
    expect(
      parseCoachCapacitySettingsCells(validCells, 'Prefers mornings'),
    ).toEqual({
      success: true,
      settings: {
        groupSessionsPerWeek: 2,
        projectsHours: 1.25,
        internalTimeHours: 0.5,
        teamMeetingHours: 1,
        desiredHours: 20,
        notes: 'Prefers mornings',
      },
    });
  });

  it('reads the formatted cells of a mapped report row back to its settings', () => {
    const settings = createMockCoachCapacitySettings({
      groupSessionsPerWeek: 3,
      projectsHours: 2.25,
      internalTimeHours: 0,
      teamMeetingHours: 0.75,
      desiredHours: null,
      notes: 'Away in July',
    });
    const { cells } = mapCoachCapacityRowToTableRow(
      createMockCoachCapacityReportRow({ settings }),
    );

    expect(parseCoachCapacitySettingsCells(cells, settings.notes)).toEqual({
      success: true,
      settings,
    });
  });

  it('treats an empty Desired Hours cell as not set', () => {
    const result = parseCoachCapacitySettingsCells(
      { ...validCells, desiredHours: '  ' },
      '',
    );

    expect(result).toMatchObject({
      success: true,
      settings: { desiredHours: null },
    });
  });

  it('accepts the bounds of the hours range', () => {
    const result = parseCoachCapacitySettingsCells(
      {
        groupSessionsPerWeek: '0',
        projectsHours: '0',
        internalTimeHours: '40',
        teamMeetingHours: '39.75',
        desiredHours: '0',
      },
      '',
    );

    expect(result.success).toBe(true);
  });

  it.each([
    ['above 40', '40.25'],
    ['below 0', '-0.25'],
    ['not a 0.25 step', '1.1'],
    ['not a number', 'abc'],
    ['empty', ''],
  ])('rejects hours that are %s', (_, value) => {
    expect(
      parseCoachCapacitySettingsCells(
        { ...validCells, projectsHours: value },
        '',
      ),
    ).toEqual({
      success: false,
      errors: { projectsHours: 'Enter hours from 0 to 40 in steps of 0.25' },
    });
  });

  it('rejects Desired Hours outside the hours range', () => {
    expect(
      parseCoachCapacitySettingsCells(
        { ...validCells, desiredHours: '45' },
        '',
      ),
    ).toEqual({
      success: false,
      errors: { desiredHours: 'Enter hours from 0 to 40 in steps of 0.25' },
    });
  });

  it.each([
    ['fractional', '1.5'],
    ['negative', '-1'],
    ['empty', ''],
  ])('rejects a %s Group Sessions count', (_, value) => {
    expect(
      parseCoachCapacitySettingsCells(
        { ...validCells, groupSessionsPerWeek: value },
        '',
      ),
    ).toEqual({
      success: false,
      errors: { groupSessionsPerWeek: 'Enter a whole number from 0 to 40' },
    });
  });

  it('reports every invalid cell at once', () => {
    const result = parseCoachCapacitySettingsCells(
      {
        ...validCells,
        groupSessionsPerWeek: '2.5',
        internalTimeHours: '41',
        teamMeetingHours: '0.3',
      },
      '',
    );

    expect(result.success).toBe(false);
    expect(!result.success && Object.keys(result.errors).sort()).toEqual([
      'groupSessionsPerWeek',
      'internalTimeHours',
      'teamMeetingHours',
    ]);
  });
});
