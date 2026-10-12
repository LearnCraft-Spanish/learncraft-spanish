import type { CoachCapacitySort } from '@domain/functions/coachCapacity';
import type {
  CoachCapacityReportRow,
  CountedMembership,
} from '@learncraft-spanish/shared';
import {
  applyCoachCapacitySettings,
  computeCoachCapacityTotals,
  DEFAULT_COACH_CAPACITY_SORT,
  formatBookedPercent,
  formatCoachCapacityHours,
  formatCoachCapacitySettingsCells,
  formatCoachCapacityTotalsCells,
  isCoachCapacitySortColumnId,
  keepRowOrder,
  mapCoachCapacityRowToTableRow,
  mapCountedMembershipsToDisplayRows,
  nextCoachCapacitySort,
  NOT_SET_DISPLAY,
  parseCoachCapacitySettingsCells,
  resolveCoachCapacitySettingsCells,
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
  committedHours = 10,
): CoachCapacityReportRow {
  return createMockCoachCapacityReportRow({
    coach: { coach_id: fullName.length, fullName, email: 'coach@example.test' },
    settings: createMockCoachCapacitySettings({ desiredHours }),
    committedHours,
    bookedPercent,
  });
}

function names(rows: CoachCapacityReportRow[]): string[] {
  return rows.map((row) => row.coach.fullName);
}

const bookedAscending: CoachCapacitySort = {
  columnId: 'bookedPercent',
  direction: 'ascending',
};
const bookedDescending: CoachCapacitySort = {
  columnId: 'bookedPercent',
  direction: 'descending',
};
const committedAscending: CoachCapacitySort = {
  columnId: 'committedHours',
  direction: 'ascending',
};
const committedDescending: CoachCapacitySort = {
  columnId: 'committedHours',
  direction: 'descending',
};

describe('sortCoachCapacityRows', () => {
  const bookedRows = [
    coachRow('Booked Eighty', 20, 80),
    coachRow('Not Set Up', null, null),
    coachRow('Booked Ten', 20, 10),
    coachRow('Zero Desired', 0, null),
    coachRow('Booked Fifty', 20, 50.5),
  ];

  it('defaults to least booked first', () => {
    expect(DEFAULT_COACH_CAPACITY_SORT).toEqual(bookedAscending);
  });

  it('by Booked % ascending, puts coaches with no Desired Hours first, then least booked', () => {
    expect(names(sortCoachCapacityRows(bookedRows, bookedAscending))).toEqual([
      'Not Set Up',
      'Zero Desired',
      'Booked Ten',
      'Booked Fifty',
      'Booked Eighty',
    ]);
  });

  it('by Booked % descending, still puts coaches with no Desired Hours first, then most booked', () => {
    expect(names(sortCoachCapacityRows(bookedRows, bookedDescending))).toEqual([
      'Not Set Up',
      'Zero Desired',
      'Booked Eighty',
      'Booked Fifty',
      'Booked Ten',
    ]);
  });

  it.each([bookedAscending, bookedDescending])(
    'breaks Booked % ties by coach name A to Z ($direction)',
    (sort) => {
      const rows = [
        coachRow('Carla', 10, 40),
        coachRow('Ana', 10, 40),
        coachRow('Beto', 10, 40),
      ];

      expect(names(sortCoachCapacityRows(rows, sort))).toEqual([
        'Ana',
        'Beto',
        'Carla',
      ]);
    },
  );

  it.each([bookedAscending, bookedDescending])(
    'sorts coaches without Desired Hours by name ($direction)',
    (sort) => {
      const rows = [coachRow('Zoe', null, null), coachRow('Ana', null, null)];

      expect(names(sortCoachCapacityRows(rows, sort))).toEqual(['Ana', 'Zoe']);
    },
  );

  it('keeps a coach without Desired Hours ahead of a 0% booked coach', () => {
    const rows = [coachRow('Aaron', 10, 0), coachRow('Zoe', null, null)];

    expect(names(sortCoachCapacityRows(rows, bookedAscending))).toEqual([
      'Zoe',
      'Aaron',
    ]);
  });

  describe('by Committed Hours', () => {
    const committedRows = [
      coachRow('Twelve', 20, 60, 12),
      coachRow('Not Set Up', null, null, 8),
      coachRow('Four', 20, 20, 4),
      coachRow('Twenty', 20, 100, 20),
    ];

    it('sorts ascending, with coaches without Desired Hours among the rest', () => {
      expect(
        names(sortCoachCapacityRows(committedRows, committedAscending)),
      ).toEqual(['Four', 'Not Set Up', 'Twelve', 'Twenty']);
    });

    it('sorts descending, with coaches without Desired Hours among the rest', () => {
      expect(
        names(sortCoachCapacityRows(committedRows, committedDescending)),
      ).toEqual(['Twenty', 'Twelve', 'Not Set Up', 'Four']);
    });

    it.each([committedAscending, committedDescending])(
      'breaks ties by coach name A to Z ($direction)',
      (sort) => {
        const rows = [
          coachRow('Carla', 10, 80, 8),
          coachRow('Ana', null, null, 8),
          coachRow('Beto', 20, 40, 8),
        ];

        expect(names(sortCoachCapacityRows(rows, sort))).toEqual([
          'Ana',
          'Beto',
          'Carla',
        ]);
      },
    );
  });

  it('does not reorder the rows it was given', () => {
    const rows = [coachRow('Second', 10, 90), coachRow('First', 10, 10)];

    sortCoachCapacityRows(rows, bookedAscending);

    expect(names(rows)).toEqual(['Second', 'First']);
  });
});

describe('nextCoachCapacitySort', () => {
  it('switches Booked % between ascending and descending', () => {
    const once = nextCoachCapacitySort(bookedAscending, 'bookedPercent');
    const twice = nextCoachCapacitySort(once, 'bookedPercent');

    expect(once).toEqual(bookedDescending);
    expect(twice).toEqual(bookedAscending);
  });

  it('takes Committed Hours ascending, then descending, then back to the default', () => {
    const once = nextCoachCapacitySort(
      DEFAULT_COACH_CAPACITY_SORT,
      'committedHours',
    );
    const twice = nextCoachCapacitySort(once, 'committedHours');
    const thrice = nextCoachCapacitySort(twice, 'committedHours');

    expect(once).toEqual(committedAscending);
    expect(twice).toEqual(committedDescending);
    expect(thrice).toEqual(DEFAULT_COACH_CAPACITY_SORT);
  });

  it.each([committedAscending, committedDescending])(
    'sorts by Booked % ascending when it is clicked while Committed Hours is $direction',
    (current) => {
      expect(nextCoachCapacitySort(current, 'bookedPercent')).toEqual(
        bookedAscending,
      );
    },
  );

  it('sorts by Committed Hours ascending when it is clicked while Booked % is descending', () => {
    expect(nextCoachCapacitySort(bookedDescending, 'committedHours')).toEqual(
      committedAscending,
    );
  });
});

describe('isCoachCapacitySortColumnId', () => {
  it('accepts Committed Hours and Booked %', () => {
    expect(isCoachCapacitySortColumnId('committedHours')).toBe(true);
    expect(isCoachCapacitySortColumnId('bookedPercent')).toBe(true);
  });

  it.each(['coach', 'coachingHours', 'desiredHours', 'notes', ''])(
    'rejects "%s"',
    (columnId) => {
      expect(isCoachCapacitySortColumnId(columnId)).toBe(false);
    },
  );
});

describe('keepRowOrder', () => {
  it('keeps the kept order even when the sort would move rows', () => {
    expect(keepRowOrder(['b', 'a', 'c'], ['a', 'b', 'c'])).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('adds rows the kept order does not have after it, in sorted order', () => {
    expect(keepRowOrder(['d', 'b', 'a', 'c'], ['a', 'b'])).toEqual([
      'a',
      'b',
      'd',
      'c',
    ]);
  });

  it('drops kept rows that are no longer there', () => {
    expect(keepRowOrder(['b'], ['a', 'b'])).toEqual(['b']);
  });
});

describe('computeCoachCapacityTotals', () => {
  /** Irene from the manual sheet: 6.42 Coaching Hours with 1 group session */
  const ireneHours = { privateCallHours: 4.5, adminTimeHours: 0.92 };
  const ireneSettings = createMockCoachCapacitySettings({
    groupSessionsPerWeek: 1,
    projectsHours: 2,
    internalTimeHours: 1,
    teamMeetingHours: 1,
    desiredHours: 20,
  });

  it('works out Irene’s example from the manual sheet', () => {
    const totals = computeCoachCapacityTotals(ireneHours, ireneSettings);

    expect(totals.groupSessionHours).toBe(1);
    expect(totals.coachingHours).toBeCloseTo(6.42);
    expect(totals.nonCoachingHours).toBe(4);
    expect(totals.committedHours).toBeCloseTo(10.42);
    expect(totals.bookedPercent).toBeCloseTo(52.1);
    expect(formatCoachCapacityTotalsCells(totals)).toEqual({
      coachingHours: '6.42',
      committedHours: '10.42',
      bookedPercent: '52%',
    });
  });

  it('counts each group session as one Coaching Hour', () => {
    const totals = computeCoachCapacityTotals(ireneHours, {
      ...ireneSettings,
      groupSessionsPerWeek: 3,
    });

    expect(formatCoachCapacityTotalsCells(totals)).toEqual({
      coachingHours: '8.42',
      committedHours: '12.42',
      bookedPercent: '62%',
    });
  });

  it.each([
    ['empty', null],
    ['0', 0],
  ])('has no Booked %% when Desired Hours is %s', (_, desiredHours) => {
    const totals = computeCoachCapacityTotals(ireneHours, {
      ...ireneSettings,
      desiredHours,
    });

    expect(totals.bookedPercent).toBeNull();
    expect(totals.committedHours).toBeCloseTo(10.42);
    expect(formatCoachCapacityTotalsCells(totals).bookedPercent).toBe('—');
  });
});

describe('applyCoachCapacitySettings', () => {
  it('replaces the settings and the totals that follow from them, keeping the report’s hours', () => {
    const row = createMockCoachCapacityReportRow({
      privateCallHours: 4,
      adminTimeHours: 0.5,
      coachingHours: 6.5,
      committedHours: 8,
      bookedPercent: 40,
    });
    const settings = createMockCoachCapacitySettings({
      groupSessionsPerWeek: 1,
      projectsHours: 1,
      internalTimeHours: 0.5,
      teamMeetingHours: 0.5,
      desiredHours: 10,
    });

    expect(applyCoachCapacitySettings(row, settings)).toEqual({
      ...row,
      settings,
      groupSessionHours: 1,
      coachingHours: 5.5,
      nonCoachingHours: 2,
      committedHours: 7.5,
      bookedPercent: 75,
    });
  });
});

describe('formatCoachCapacitySettingsCells', () => {
  it('formats hours with 2 decimals, Group Sessions as a whole number, and no Desired Hours as empty', () => {
    expect(
      formatCoachCapacitySettingsCells(
        createMockCoachCapacitySettings({
          groupSessionsPerWeek: 2,
          projectsHours: 3,
          internalTimeHours: 0.5,
          teamMeetingHours: 1.25,
          desiredHours: null,
        }),
      ),
    ).toEqual({
      groupSessionsPerWeek: '2',
      projectsHours: '3.00',
      internalTimeHours: '0.50',
      teamMeetingHours: '1.25',
      desiredHours: '',
    });
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

describe('mapCountedMembershipsToDisplayRows', () => {
  const membership: CountedMembership = {
    studentName: 'Ana Student',
    courseName: 'Premier',
    startDate: '2026-01-05',
    endDate: '2026-12-31',
    courseWeeklyPrivateCalls: 2,
    courseWeeklyAdminTimeMinutes: 25,
  };

  it('shows each membership with readable dates and Admin Time in hours', () => {
    expect(mapCountedMembershipsToDisplayRows([membership])).toEqual([
      {
        id: '0',
        student: 'Ana Student',
        course: 'Premier',
        startDate: 'Jan 05, 2026',
        endDate: 'Dec 31, 2026',
        weeklyPrivateCalls: '2',
        weeklyAdminTime: '0.42',
      },
    ]);
  });

  it('shows a dash for a membership with no end date', () => {
    const [row] = mapCountedMembershipsToDisplayRows([
      { ...membership, endDate: null },
    ]);

    expect(row.endDate).toBe(NOT_SET_DISPLAY);
  });

  it('keeps the order it was given, keyed by position', () => {
    const rows = mapCountedMembershipsToDisplayRows([
      membership,
      { ...membership, studentName: 'Beto Student' },
    ]);

    expect(rows.map((row) => [row.id, row.student])).toEqual([
      ['0', 'Ana Student'],
      ['1', 'Beto Student'],
    ]);
  });

  it('returns no rows for a coach with no counted memberships', () => {
    expect(mapCountedMembershipsToDisplayRows([])).toEqual([]);
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

describe('resolveCoachCapacitySettingsCells', () => {
  const fallback = createMockCoachCapacitySettings({
    groupSessionsPerWeek: 1,
    projectsHours: 0.5,
    internalTimeHours: 0.25,
    teamMeetingHours: 0.75,
    desiredHours: 10,
    notes: 'Saved notes',
  });
  const validCells = {
    groupSessionsPerWeek: '2',
    projectsHours: '3',
    internalTimeHours: '1.5',
    teamMeetingHours: '1',
    desiredHours: '',
  };

  it('reads valid cells, with the fallback’s notes', () => {
    expect(resolveCoachCapacitySettingsCells(validCells, fallback)).toEqual({
      groupSessionsPerWeek: 2,
      projectsHours: 3,
      internalTimeHours: 1.5,
      teamMeetingHours: 1,
      desiredHours: null,
      notes: 'Saved notes',
    });
  });

  it('takes only the invalid cells from the fallback', () => {
    expect(
      resolveCoachCapacitySettingsCells(
        { ...validCells, projectsHours: '3.1', groupSessionsPerWeek: '1.5' },
        fallback,
      ),
    ).toEqual({
      groupSessionsPerWeek: 1,
      projectsHours: 0.5,
      internalTimeHours: 1.5,
      teamMeetingHours: 1,
      desiredHours: null,
      notes: 'Saved notes',
    });
  });

  it('takes an invalid Desired Hours from the fallback', () => {
    expect(
      resolveCoachCapacitySettingsCells(
        { ...validCells, desiredHours: '41' },
        fallback,
      ).desiredHours,
    ).toBe(10);
  });
});
