import type { UpdateCoachCapacitySettingsVariables } from '@application/queries/AdminReportQueries/useUpdateCoachCapacitySettingsMutation';
import type { UseCoachCapacityReportResult } from '@application/useCases/useCoachCapacityReport/useCoachCapacityReport';
import type { CoachCapacityPeriod } from '@domain/functions/coachCapacity';
import type {
  CoachCapacityReportRow,
  CoachCapacitySettings,
} from '@learncraft-spanish/shared';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useCoachCapacityReportQuery } from '@application/queries/AdminReportQueries/useCoachCapacityReportQuery';
import {
  mockUseCoachCapacityReportQuery,
  overrideMockUseCoachCapacityReportQuery,
  resetMockUseCoachCapacityReportQuery,
} from '@application/queries/AdminReportQueries/useCoachCapacityReportQuery.mock';
import {
  mockUseUpdateCoachCapacitySettingsMutation,
  overrideMockUseUpdateCoachCapacitySettingsMutation,
  resetMockUseUpdateCoachCapacitySettingsMutation,
} from '@application/queries/AdminReportQueries/useUpdateCoachCapacitySettingsMutation.mock';
import { useCoachCapacityReport } from '@application/useCases/useCoachCapacityReport/useCoachCapacityReport';
import { applyCoachCapacitySettings } from '@domain/functions/coachCapacity';
import { act, renderHook } from '@testing-library/react';
import { createMockCoachCapacityReportRow } from '@testing/factories/adminReportsFactory';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/queries/AdminReportQueries/useCoachCapacityReportQuery',
  () => ({
    useCoachCapacityReportQuery: vi.fn(() => mockUseCoachCapacityReportQuery),
  }),
);

vi.mock(
  '@application/queries/AdminReportQueries/useUpdateCoachCapacitySettingsMutation',
  () => ({
    useUpdateCoachCapacitySettingsMutation: () =>
      mockUseUpdateCoachCapacitySettingsMutation,
  }),
);

function queryResult(
  overrides: Partial<UseQueryResult<CoachCapacityReportRow[]>>,
): UseQueryResult<CoachCapacityReportRow[]> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    isSuccess: false,
    status: 'pending',
    ...overrides,
  } as UseQueryResult<CoachCapacityReportRow[]>;
}

const defaultSettings = {
  groupSessionsPerWeek: 2,
  projectsHours: 1.25,
  internalTimeHours: 0.5,
  teamMeetingHours: 1,
  desiredHours: 20,
};

/** A coach as the API reports them, with totals that follow from their hours and settings */
function coachRow(
  coachId: number,
  fullName: string,
  {
    privateCallHours,
    adminTimeHours = 0.5,
    settings = {},
  }: {
    privateCallHours: number;
    adminTimeHours?: number;
    settings?: Partial<CoachCapacitySettings>;
  },
): CoachCapacityReportRow {
  return applyCoachCapacitySettings(
    createMockCoachCapacityReportRow({
      coach: { coach_id: coachId, fullName, email: 'coach@example.test' },
      privateCallHours,
      adminTimeHours,
      countedMemberships: [],
    }),
    { ...defaultSettings, notes: `${fullName} notes`, ...settings },
  );
}

// Booked % 93%: 13.25 + 0.5 + 2 = 15.75 Coaching Hours, 18.5 Committed
const mostlyBooked = coachRow(1, 'Mostly Booked', { privateCallHours: 13.25 });
// Booked % 31%: 1 + 0.5 + 2 = 3.5 Coaching Hours, 6.25 Committed
const lightlyBooked = coachRow(2, 'Lightly Booked', { privateCallHours: 1 });
const notSetUp = coachRow(3, 'Not Set Up', {
  privateCallHours: 4,
  settings: { desiredHours: null },
});

function showReport(rows: CoachCapacityReportRow[]): void {
  overrideMockUseCoachCapacityReportQuery({
    coachCapacityReportQuery: queryResult({
      data: rows,
      isSuccess: true,
      status: 'success',
    }),
  });
}

type UpdateSettings = (
  variables: UpdateCoachCapacitySettingsVariables,
) => Promise<CoachCapacitySettings>;

function mockUpdateSettings(implementation: UpdateSettings) {
  const mutateAsync = vi.fn(implementation);
  overrideMockUseUpdateCoachCapacitySettingsMutation({
    updateCoachCapacitySettingsMutation: {
      ...mockUseUpdateCoachCapacitySettingsMutation.updateCoachCapacitySettingsMutation,
      mutateAsync,
    } as UseMutationResult<
      CoachCapacitySettings,
      Error,
      UpdateCoachCapacitySettingsVariables
    >,
  });
  return mutateAsync;
}

/** Saves succeed, returning the saved row's settings with the changes */
function saveSucceeds() {
  return mockUpdateSettings(async ({ coachId, changes }) => {
    const row = [mostlyBooked, lightlyBooked, notSetUp].find(
      (coach) => coach.coach.coach_id === coachId,
    );
    return { ...row!.settings, ...changes };
  });
}

function saveFails() {
  return mockUpdateSettings(async () => {
    throw new Error('Failed to save');
  });
}

function cellsOf(
  result: { current: UseCoachCapacityReportResult },
  rowId: string,
): Record<string, string> {
  const row = result.current.tableProps.rows.find((r) => r.id === rowId);
  if (!row) throw new Error(`Row ${rowId} is not in the table`);
  return row.cells;
}

function totalsOf(
  result: { current: UseCoachCapacityReportResult },
  rowId: string,
): [string, string, string] {
  const { coachingHours, committedHours, bookedPercent } = cellsOf(
    result,
    rowId,
  );
  return [coachingHours, committedHours, bookedPercent];
}

function rowOrder(result: { current: UseCoachCapacityReportResult }) {
  return result.current.tableProps.rows.map((row) => row.cells.coach);
}

function typeInto(
  result: { current: UseCoachCapacityReportResult },
  rowId: string,
  columnId: string,
  value: string,
): void {
  act(() => result.current.tableProps.onCellChange(rowId, columnId, value));
}

async function commit(
  result: { current: UseCoachCapacityReportResult },
  rowId: string,
  columnId: string,
): Promise<void> {
  await act(async () => result.current.commitCell(rowId, columnId));
}

describe('useCoachCapacityReport', () => {
  beforeEach(() => {
    showReport([mostlyBooked, lightlyBooked, notSetUp]);
  });

  afterEach(() => {
    resetMockUseCoachCapacityReportQuery();
    resetMockUseUpdateCoachCapacitySettingsMutation();
  });

  describe('period', () => {
    const membership = {
      studentName: 'Ana Student',
      courseName: 'Premier',
      startDate: '2026-01-05',
      endDate: null,
      courseWeeklyPrivateCalls: 2,
      courseWeeklyAdminTimeMinutes: 30,
    };

    const todayRows = [
      { ...mostlyBooked, countedMemberships: [membership] },
      lightlyBooked,
    ];
    const twoWeeksOutRows = [
      mostlyBooked,
      coachRow(2, 'Lightly Booked', { privateCallHours: 0 }),
    ];

    /** Serves each period its own report; a period missing from `loaded` is still loading */
    function showReportsByPeriod(
      loaded: Partial<Record<CoachCapacityPeriod, CoachCapacityReportRow[]>>,
    ): void {
      vi.mocked(useCoachCapacityReportQuery).mockImplementation((period) => {
        const rows = loaded[period];
        return {
          coachCapacityReportQuery: rows
            ? queryResult({ data: rows, isSuccess: true, status: 'success' })
            : queryResult({ isLoading: true }),
        };
      });
    }

    it('starts on Today', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      expect(result.current.period).toBe('today');
      expect(useCoachCapacityReportQuery).toHaveBeenLastCalledWith('today');
    });

    it('reports on the selected period', () => {
      showReportsByPeriod({ today: todayRows, twoWeeksOut: twoWeeksOutRows });
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() => result.current.selectPeriod('twoWeeksOut'));

      expect(result.current.period).toBe('twoWeeksOut');
      expect(useCoachCapacityReportQuery).toHaveBeenLastCalledWith(
        'twoWeeksOut',
      );
      expect(cellsOf(result, '2').coachingHours).toBe('2.50');
    });

    it('keeps unsaved edits, and counts them in the totals, across a switch', () => {
      showReportsByPeriod({ today: todayRows });
      const { result, rerender } = renderHook(() => useCoachCapacityReport());
      typeInto(result, '2', 'projectsHours', '3');

      act(() => result.current.selectPeriod('twoWeeksOut'));
      expect(result.current.tableProps.isLoading).toBe(true);

      showReportsByPeriod({ today: todayRows, twoWeeksOut: twoWeeksOutRows });
      rerender();

      expect(cellsOf(result, '2').projectsHours).toBe('3');
      // 2.5 Coaching Hours two weeks out + 3 + 0.5 + 1
      expect(totalsOf(result, '2')).toEqual(['2.50', '7.00', '35%']);
      expect(result.current.tableProps.dirtyRowIds).toEqual(new Set(['2']));
      act(() => result.current.selectPeriod('today'));
      expect(cellsOf(result, '2').projectsHours).toBe('3');
    });

    it('keeps a value that failed to save, with its error, across a switch', async () => {
      saveFails();
      showReportsByPeriod({ today: todayRows, twoWeeksOut: twoWeeksOutRows });
      const { result } = renderHook(() => useCoachCapacityReport());
      typeInto(result, '2', 'projectsHours', '3');
      await commit(result, '2', 'projectsHours');

      act(() => result.current.selectPeriod('twoWeeksOut'));

      expect(cellsOf(result, '2').projectsHours).toBe('3.00');
      expect(totalsOf(result, '2')).toEqual(['2.50', '7.00', '35%']);
      expect(result.current.tableProps.dirtyRowIds).toEqual(new Set(['2']));
      expect(result.current.saveError).toContain('Lightly Booked');
    });

    it('keeps the notes panel open with its draft across a switch', async () => {
      const updateSettings = saveSucceeds();
      showReportsByPeriod({ today: todayRows });
      const { result, rerender } = renderHook(() => useCoachCapacityReport());
      act(() => result.current.openNotes('1'));
      act(() => result.current.notesPanel.setDraft('Full until August'));

      act(() => result.current.selectPeriod('twoWeeksOut'));
      expect(result.current.notesPanel.coachName).toBe('Mostly Booked');
      expect(result.current.notesPanel.draft).toBe('Full until August');

      showReportsByPeriod({ today: todayRows, twoWeeksOut: twoWeeksOutRows });
      rerender();
      await act(() => result.current.notesPanel.save());

      expect(updateSettings).toHaveBeenCalledExactlyOnceWith({
        coachId: 1,
        changes: { notes: 'Full until August' },
      });
      expect(result.current.notesPanel.coachName).toBeNull();
    });

    it('does not save notes before the selected period has loaded', async () => {
      const updateSettings = saveSucceeds();
      showReportsByPeriod({ today: todayRows });
      const { result } = renderHook(() => useCoachCapacityReport());
      act(() => result.current.openNotes('1'));
      act(() => result.current.selectPeriod('twoWeeksOut'));

      await act(() => result.current.notesPanel.save());

      expect(updateSettings).not.toHaveBeenCalled();
      expect(result.current.notesPanel.coachName).toBe('Mostly Booked');
      expect(result.current.notesPanel.error).toBe(
        'Notes could not be saved. Try again.',
      );
    });

    it('keeps the drilldown on the coach, loading, then showing their memberships in the new period', () => {
      showReportsByPeriod({ today: todayRows });
      const { result, rerender } = renderHook(() => useCoachCapacityReport());
      act(() => result.current.openDrilldown('1'));
      expect(result.current.drilldown.memberships).toHaveLength(1);

      act(() => result.current.selectPeriod('twoWeeksOut'));
      expect(result.current.drilldown.coachName).toBe('Mostly Booked');
      expect(result.current.drilldown.isLoading).toBe(true);

      showReportsByPeriod({ today: todayRows, twoWeeksOut: twoWeeksOutRows });
      rerender();
      expect(result.current.drilldown.coachName).toBe('Mostly Booked');
      expect(result.current.drilldown.isLoading).toBe(false);
      expect(result.current.drilldown.memberships).toEqual([]);
    });
  });

  describe('report', () => {
    it('returns one row per coach, least booked first', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      expect(rowOrder(result)).toEqual([
        'Not Set Up',
        'Lightly Booked',
        'Mostly Booked',
      ]);
      expect(
        result.current.tableProps.rows.map((row) => row.cells.bookedPercent),
      ).toEqual(['—', '31%', '93%']);
    });

    it('works out the totals from the report’s Private Call and Admin Time hours and the settings', () => {
      showReport([
        {
          ...lightlyBooked,
          privateCallHours: 2,
          adminTimeHours: 0.25,
          coachingHours: 99,
          committedHours: 99,
          bookedPercent: 99,
        },
      ]);
      const { result } = renderHook(() => useCoachCapacityReport());

      // 2 + 0.25 + 2 group sessions; + 1.25 + 0.5 + 1; ÷ 20
      expect(totalsOf(result, '2')).toEqual(['4.25', '7.00', '35%']);
    });

    it('makes the five settings editable and the rest read-only', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      expect(
        result.current.tableProps.columns.map((column) => [
          column.id,
          column.editable !== false,
        ]),
      ).toEqual([
        ['coach', false],
        ['coachingHours', false],
        ['groupSessionsPerWeek', true],
        ['projectsHours', true],
        ['internalTimeHours', true],
        ['teamMeetingHours', true],
        ['committedHours', false],
        ['desiredHours', true],
        ['bookedPercent', false],
        ['notes', false],
      ]);
    });

    it('has no Save or Discard', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      expect(result.current.tableProps.onSave).toBeUndefined();
      expect(result.current.tableProps.onDiscard).toBeUndefined();
    });

    it('returns no rows while the report is loading', () => {
      overrideMockUseCoachCapacityReportQuery({
        coachCapacityReportQuery: queryResult({ isLoading: true }),
      });

      const { result } = renderHook(() => useCoachCapacityReport());

      expect(result.current.tableProps.isLoading).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.tableProps.rows).toEqual([]);
    });

    it('exposes the error state when the report fails to load', () => {
      overrideMockUseCoachCapacityReportQuery({
        coachCapacityReportQuery: queryResult({
          isError: true,
          status: 'error',
        }),
      });

      const { result } = renderHook(() => useCoachCapacityReport());

      expect(result.current.isError).toBe(true);
      expect(result.current.tableProps.isLoading).toBe(false);
      expect(result.current.tableProps.rows).toEqual([]);
    });
  });

  describe('totals while typing', () => {
    it('update the edited row on every keystroke', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '2', 'projectsHours', '3');
      expect(totalsOf(result, '2')).toEqual(['3.50', '8.00', '40%']);

      typeInto(result, '2', 'projectsHours', '3.5');
      expect(totalsOf(result, '2')).toEqual(['3.50', '8.50', '43%']);

      typeInto(result, '2', 'teamMeetingHours', '2');
      expect(totalsOf(result, '2')).toEqual(['3.50', '9.50', '48%']);
      expect(totalsOf(result, '1')).toEqual(['15.75', '18.50', '93%']);
    });

    it('move Coaching Hours with Group Sessions', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '2', 'groupSessionsPerWeek', '4');

      expect(totalsOf(result, '2')).toEqual(['5.50', '8.25', '41%']);
    });

    it.each(['', '0'])(
      'show no Booked %% when Desired Hours is "%s"',
      (desiredHours) => {
        const { result } = renderHook(() => useCoachCapacityReport());

        typeInto(result, '2', 'desiredHours', desiredHours);

        expect(totalsOf(result, '2')).toEqual(['3.50', '6.25', '—']);
      },
    );

    it('stay at the last valid value while a cell is invalid', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '2', 'projectsHours', '3');
      typeInto(result, '2', 'projectsHours', '3.1');
      expect(totalsOf(result, '2')).toEqual(['3.50', '8.00', '40%']);
      expect(result.current.tableProps.validationErrors).toEqual({
        '2': { projectsHours: 'Enter hours from 0 to 40 in steps of 0.25' },
      });

      typeInto(result, '2', 'teamMeetingHours', '2');
      expect(totalsOf(result, '2')).toEqual(['3.50', '9.00', '45%']);

      typeInto(result, '2', 'projectsHours', '3.25');
      expect(totalsOf(result, '2')).toEqual(['3.50', '9.25', '46%']);
      expect(result.current.tableProps.isValid).toBe(true);
    });

    it('stay at the saved value when the first value typed is invalid', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '1', 'groupSessionsPerWeek', '1.5');

      expect(totalsOf(result, '1')).toEqual(['15.75', '18.50', '93%']);
      expect(result.current.tableProps.validationErrors).toEqual({
        '1': { groupSessionsPerWeek: 'Enter a whole number from 0 to 40' },
      });
    });
  });

  describe('saving', () => {
    it('sends nothing while the admin types', async () => {
      const updateSettings = saveSucceeds();
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '2', 'projectsHours', '3');
      typeInto(result, '2', 'teamMeetingHours', '2');
      await act(async () => {});

      expect(updateSettings).not.toHaveBeenCalled();
      expect(result.current.tableProps.dirtyRowIds).toEqual(new Set(['2']));
    });

    it('saves the coach’s settings once when an edited cell is committed', async () => {
      const updateSettings = saveSucceeds();
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '2', 'projectsHours', '3');
      await commit(result, '2', 'projectsHours');
      await commit(result, '2', 'projectsHours');

      expect(updateSettings).toHaveBeenCalledExactlyOnceWith({
        coachId: 2,
        changes: {
          groupSessionsPerWeek: 2,
          projectsHours: 3,
          internalTimeHours: 0.5,
          teamMeetingHours: 1,
          desiredHours: 20,
        },
      });
    });

    it('does not save a cell that was not edited', async () => {
      const updateSettings = saveSucceeds();
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '2', 'projectsHours', '3');
      await commit(result, '2', 'teamMeetingHours');
      await commit(result, '1', 'projectsHours');

      expect(updateSettings).not.toHaveBeenCalled();
    });

    it('sends a cleared Desired Hours as not set', async () => {
      const updateSettings = saveSucceeds();
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '1', 'desiredHours', '');
      await commit(result, '1', 'desiredHours');

      expect(updateSettings).toHaveBeenCalledWith({
        coachId: 1,
        changes: expect.objectContaining({ desiredHours: null }),
      });
    });

    it('formats a committed value like a saved one', async () => {
      saveSucceeds();
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '2', 'projectsHours', '3');
      await commit(result, '2', 'projectsHours');

      expect(cellsOf(result, '2').projectsHours).toBe('3.00');
    });

    it('does not send an invalid value', async () => {
      const updateSettings = saveSucceeds();
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '2', 'projectsHours', '3.1');
      await commit(result, '2', 'projectsHours');

      expect(updateSettings).not.toHaveBeenCalled();
      expect(cellsOf(result, '2').projectsHours).toBe('3.1');
      expect(totalsOf(result, '2')).toEqual(['3.50', '6.25', '31%']);
    });

    it('stops marking the coach as edited once the report holds the saved settings, keeping newer typing', async () => {
      saveSucceeds();
      const { result, rerender } = renderHook(() => useCoachCapacityReport());
      typeInto(result, '2', 'projectsHours', '3');
      await commit(result, '2', 'projectsHours');
      typeInto(result, '1', 'teamMeetingHours', '2');

      showReport([
        mostlyBooked,
        applyCoachCapacitySettings(lightlyBooked, {
          ...lightlyBooked.settings,
          projectsHours: 3,
        }),
        notSetUp,
      ]);
      rerender();

      expect(result.current.tableProps.dirtyRowIds).toEqual(new Set(['1']));
      expect(cellsOf(result, '2').projectsHours).toBe('3.00');
      expect(cellsOf(result, '1').teamMeetingHours).toBe('2');
    });

    it('keeps a value that failed to save, names the coach, and counts it in the totals', async () => {
      saveFails();
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '2', 'projectsHours', '3');
      await commit(result, '2', 'projectsHours');

      expect(result.current.saveError).toBe(
        'Could not save settings for Lightly Booked. Your changes are still in the table.',
      );
      expect(cellsOf(result, '2').projectsHours).toBe('3.00');
      expect(result.current.tableProps.dirtyRowIds).toEqual(new Set(['2']));
      expect(totalsOf(result, '2')).toEqual(['3.50', '8.00', '40%']);
    });

    it('retries a failed save the next time the cell is edited, clearing the error once it saves', async () => {
      const updateSettings = saveFails();
      const { result } = renderHook(() => useCoachCapacityReport());
      typeInto(result, '2', 'projectsHours', '3');
      await commit(result, '2', 'projectsHours');
      await commit(result, '2', 'projectsHours');
      expect(updateSettings).toHaveBeenCalledOnce();

      const retry = saveSucceeds();
      typeInto(result, '2', 'projectsHours', '3.5');
      await commit(result, '2', 'projectsHours');

      expect(retry).toHaveBeenCalledExactlyOnceWith({
        coachId: 2,
        changes: expect.objectContaining({ projectsHours: 3.5 }),
      });
      expect(result.current.saveError).toBeNull();
    });

    it('names every coach whose latest save failed', async () => {
      saveFails();
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '2', 'projectsHours', '3');
      await commit(result, '2', 'projectsHours');
      typeInto(result, '3', 'desiredHours', '25');
      await commit(result, '3', 'desiredHours');

      expect(result.current.saveError).toBe(
        'Could not save settings for Lightly Booked, Not Set Up. Your changes are still in the table.',
      );
    });

    it('is saving while a save is on its way', async () => {
      let finishSave = (): void => {};
      mockUpdateSettings(
        ({ changes }) =>
          new Promise((resolve) => {
            finishSave = () =>
              resolve({ ...lightlyBooked.settings, ...changes });
          }),
      );
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '2', 'projectsHours', '3');
      await commit(result, '2', 'projectsHours');
      expect(result.current.tableProps.isSaving).toBe(true);

      await act(async () => finishSave());
      expect(result.current.tableProps.isSaving).toBe(false);
    });
  });

  describe('row order', () => {
    it('re-sorts by the values shown, edits included', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      // 6.25 Committed Hours ÷ 5 Desired Hours = 125%
      typeInto(result, '2', 'desiredHours', '5');

      expect(rowOrder(result)).toEqual([
        'Not Set Up',
        'Mostly Booked',
        'Lightly Booked',
      ]);
    });

    it('holds while focus is in the table and re-sorts once it leaves', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() => result.current.onTableFocus());
      typeInto(result, '2', 'desiredHours', '5');
      act(() => result.current.onTableFocus());
      // 9.25 Committed Hours ÷ 5 Desired Hours = 185%
      typeInto(result, '3', 'desiredHours', '5');
      expect(rowOrder(result)).toEqual([
        'Not Set Up',
        'Lightly Booked',
        'Mostly Booked',
      ]);

      act(() => result.current.onTableBlur());
      expect(rowOrder(result)).toEqual([
        'Mostly Booked',
        'Lightly Booked',
        'Not Set Up',
      ]);
    });
  });

  describe('notes panel', () => {
    it('opens on a coach with their saved notes', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      expect(result.current.notesPanel.coachName).toBeNull();
      act(() => result.current.openNotes('2'));

      expect(result.current.notesPanel.coachName).toBe('Lightly Booked');
      expect(result.current.notesPanel.draft).toBe('Lightly Booked notes');
    });

    it('saves only the edited notes, keeping the coach’s saved settings, then closes', async () => {
      const updateSettings = saveSucceeds();
      const { result } = renderHook(() => useCoachCapacityReport());

      typeInto(result, '2', 'projectsHours', '3');
      act(() => result.current.openNotes('2'));
      act(() => result.current.notesPanel.setDraft('Back from leave in May'));
      await act(() => result.current.notesPanel.save());

      expect(updateSettings).toHaveBeenCalledExactlyOnceWith({
        coachId: 2,
        changes: { notes: 'Back from leave in May' },
      });
      expect(result.current.notesPanel.coachName).toBeNull();
      expect(result.current.tableProps.dirtyRowIds).toEqual(new Set(['2']));
    });

    it('stays open with the draft and an error when the save fails', async () => {
      saveFails();
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() => result.current.openNotes('1'));
      act(() => result.current.notesPanel.setDraft('New note'));
      await act(() => result.current.notesPanel.save());

      expect(result.current.notesPanel.coachName).toBe('Mostly Booked');
      expect(result.current.notesPanel.draft).toBe('New note');
      expect(result.current.notesPanel.error).toBe(
        'Notes could not be saved. Try again.',
      );
      expect(result.current.notesPanel.isSaving).toBe(false);
      expect(result.current.saveError).toBeNull();
    });

    it('closes without saving', () => {
      const updateSettings = saveSucceeds();
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() => result.current.openNotes('1'));
      act(() => result.current.notesPanel.close());

      expect(result.current.notesPanel.coachName).toBeNull();
      expect(updateSettings).not.toHaveBeenCalled();
    });
  });

  describe('drilldown', () => {
    const membership = {
      studentName: 'Ana Student',
      courseName: 'Premier',
      startDate: '2026-01-05',
      endDate: null,
      courseWeeklyPrivateCalls: 2,
      courseWeeklyAdminTimeMinutes: 30,
    };

    it('is closed until a coach is opened', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      expect(result.current.drilldown.coachName).toBeNull();
      expect(result.current.drilldown.memberships).toEqual([]);
    });

    it('opens on a coach with their counted memberships', () => {
      showReport([
        mostlyBooked,
        { ...lightlyBooked, countedMemberships: [membership] },
      ]);
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() => result.current.openDrilldown('2'));

      expect(result.current.drilldown.coachName).toBe('Lightly Booked');
      expect(result.current.drilldown.memberships).toEqual([
        {
          id: '0',
          student: 'Ana Student',
          course: 'Premier',
          startDate: 'Jan 05, 2026',
          endDate: '—',
          weeklyPrivateCalls: '2',
          weeklyAdminTime: '0.50',
        },
      ]);
    });

    it('opens on a coach with no counted memberships', () => {
      showReport([mostlyBooked]);
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() => result.current.openDrilldown('1'));

      expect(result.current.drilldown.coachName).toBe('Mostly Booked');
      expect(result.current.drilldown.memberships).toEqual([]);
    });

    it('shows the refetched memberships of the open coach', () => {
      showReport([mostlyBooked]);
      const { result, rerender } = renderHook(() => useCoachCapacityReport());
      act(() => result.current.openDrilldown('1'));

      showReport([{ ...mostlyBooked, countedMemberships: [membership] }]);
      rerender();

      expect(
        result.current.drilldown.memberships.map((row) => row.student),
      ).toEqual(['Ana Student']);
    });

    it('ignores a coach who is not in the report', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() => result.current.openDrilldown('99'));

      expect(result.current.drilldown.coachName).toBeNull();
    });

    it('closes', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() => result.current.openDrilldown('1'));
      act(() => result.current.drilldown.close());

      expect(result.current.drilldown.coachName).toBeNull();
    });
  });
});
