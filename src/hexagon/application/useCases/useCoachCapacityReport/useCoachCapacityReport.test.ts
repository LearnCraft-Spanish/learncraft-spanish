import type { UpdateCoachCapacitySettingsCommand } from '@application/ports/AdminReports/adminReportsPort';
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
import { act, renderHook } from '@testing-library/react';
import {
  createMockCoachCapacityReportRow,
  createMockCoachCapacitySettings,
} from '@testing/factories/adminReportsFactory';
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

function coachRow(
  coachId: number,
  fullName: string,
  bookedPercent: number | null,
  settings: Partial<CoachCapacitySettings> = {},
): CoachCapacityReportRow {
  return createMockCoachCapacityReportRow({
    coach: { coach_id: coachId, fullName, email: 'coach@example.test' },
    settings: createMockCoachCapacitySettings({
      groupSessionsPerWeek: 2,
      projectsHours: 1.25,
      internalTimeHours: 0.5,
      teamMeetingHours: 1,
      desiredHours: bookedPercent === null ? null : 20,
      notes: `${fullName} notes`,
      ...settings,
    }),
    bookedPercent,
  });
}

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
  command: UpdateCoachCapacitySettingsCommand,
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
      UpdateCoachCapacitySettingsCommand
    >,
  });
  return mutateAsync;
}

function cellsOf(
  result: { current: UseCoachCapacityReportResult },
  rowId: string,
): Record<string, string> {
  const row = result.current.tableProps.rows.find((r) => r.id === rowId);
  if (!row) throw new Error(`Row ${rowId} is not in the table`);
  return row.cells;
}

describe('useCoachCapacityReport', () => {
  beforeEach(() => {
    showReport([
      coachRow(1, 'Mostly Booked', 90),
      coachRow(2, 'Lightly Booked', 15, { projectsHours: 2 }),
      coachRow(3, 'Not Set Up', null),
    ]);
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
      { ...coachRow(1, 'Mostly Booked', 90), countedMemberships: [membership] },
      { ...coachRow(2, 'Lightly Booked', 15), coachingHours: 5 },
    ];
    const twoWeeksOutRows = [
      { ...coachRow(1, 'Mostly Booked', 90), countedMemberships: [] },
      { ...coachRow(2, 'Lightly Booked', 15), coachingHours: 3 },
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
      expect(cellsOf(result, '2').coachingHours).toBe('3.00');
    });

    it('keeps unsaved edits across a switch, including while the new period loads', () => {
      showReportsByPeriod({ today: todayRows });
      const { result, rerender } = renderHook(() => useCoachCapacityReport());
      act(() =>
        result.current.tableProps.onCellChange('2', 'projectsHours', '3'),
      );

      act(() => result.current.selectPeriod('twoWeeksOut'));
      expect(result.current.tableProps.isLoading).toBe(true);

      showReportsByPeriod({ today: todayRows, twoWeeksOut: twoWeeksOutRows });
      rerender();

      expect(cellsOf(result, '2').projectsHours).toBe('3');
      expect(cellsOf(result, '2').coachingHours).toBe('3.00');
      expect(result.current.tableProps.dirtyRowIds).toEqual(new Set(['2']));
      act(() => result.current.selectPeriod('today'));
      expect(cellsOf(result, '2').projectsHours).toBe('3');
    });

    it('keeps the notes panel open with its draft across a switch', async () => {
      const updateSettings = mockUpdateSettings(
        async ({ settings }) => settings,
      );
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
        settings: expect.objectContaining({ notes: 'Full until August' }),
      });
      expect(result.current.notesPanel.coachName).toBeNull();
    });

    it('does not save notes before the selected period has loaded', async () => {
      const updateSettings = mockUpdateSettings(
        async ({ settings }) => settings,
      );
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

      expect(result.current.tableProps.rows.map((row) => row.id)).toEqual([
        '3',
        '2',
        '1',
      ]);
      expect(
        result.current.tableProps.rows.map((row) => row.cells.bookedPercent),
      ).toEqual(['—', '15%', '90%']);
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

  describe('editing settings', () => {
    it('marks an edited coach as having unsaved changes', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() =>
        result.current.tableProps.onCellChange('2', 'projectsHours', '3'),
      );

      expect(cellsOf(result, '2').projectsHours).toBe('3');
      expect(result.current.tableProps.dirtyRowIds).toEqual(new Set(['2']));
      expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      expect(result.current.tableProps.isValid).toBe(true);
    });

    it('flags invalid input on its cell and blocks saving', () => {
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() =>
        result.current.tableProps.onCellChange('2', 'projectsHours', '1.1'),
      );
      act(() =>
        result.current.tableProps.onCellChange(
          '1',
          'groupSessionsPerWeek',
          '1.5',
        ),
      );

      expect(result.current.tableProps.isValid).toBe(false);
      expect(result.current.tableProps.validationErrors).toEqual({
        '2': { projectsHours: 'Enter hours from 0 to 40 in steps of 0.25' },
        '1': { groupSessionsPerWeek: 'Enter a whole number from 0 to 40' },
      });
    });

    it('saves each edited coach with their full settings, then clears the edits', async () => {
      const updateSettings = mockUpdateSettings(
        async ({ settings }) => settings,
      );
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() =>
        result.current.tableProps.onCellChange('2', 'projectsHours', '3'),
      );
      act(() =>
        result.current.tableProps.onCellChange('3', 'desiredHours', '25'),
      );
      await act(() => result.current.tableProps.onSave!());

      expect(updateSettings).toHaveBeenCalledTimes(2);
      expect(updateSettings).toHaveBeenCalledWith({
        coachId: 2,
        settings: {
          groupSessionsPerWeek: 2,
          projectsHours: 3,
          internalTimeHours: 0.5,
          teamMeetingHours: 1,
          desiredHours: 20,
          notes: 'Lightly Booked notes',
        },
      });
      expect(updateSettings).toHaveBeenCalledWith({
        coachId: 3,
        settings: {
          groupSessionsPerWeek: 2,
          projectsHours: 1.25,
          internalTimeHours: 0.5,
          teamMeetingHours: 1,
          desiredHours: 25,
          notes: 'Not Set Up notes',
        },
      });
      expect(result.current.tableProps.hasUnsavedChanges).toBe(false);
      expect(result.current.saveError).toBeNull();
      expect(result.current.tableProps.isSaving).toBe(false);
    });

    it('sends a cleared Desired Hours as not set', async () => {
      const updateSettings = mockUpdateSettings(
        async ({ settings }) => settings,
      );
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() =>
        result.current.tableProps.onCellChange('1', 'desiredHours', ''),
      );
      await act(() => result.current.tableProps.onSave!());

      expect(updateSettings).toHaveBeenCalledWith({
        coachId: 1,
        settings: expect.objectContaining({ desiredHours: null }),
      });
    });

    it('keeps the edits of coaches whose save failed and names them', async () => {
      mockUpdateSettings(async ({ coachId, settings }) => {
        if (coachId === 2) throw new Error('Failed to save');
        return settings;
      });
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() =>
        result.current.tableProps.onCellChange('2', 'projectsHours', '3'),
      );
      act(() =>
        result.current.tableProps.onCellChange('3', 'desiredHours', '25'),
      );
      await act(() => result.current.tableProps.onSave!());

      expect(result.current.saveError).toBe(
        'Could not save settings for Lightly Booked. Your changes are still in the table.',
      );
      expect(result.current.tableProps.dirtyRowIds).toEqual(new Set(['2']));
      expect(cellsOf(result, '2').projectsHours).toBe('3');
      expect(cellsOf(result, '3').desiredHours).toBe('');
    });

    it('clears the save error when the edits are discarded', async () => {
      mockUpdateSettings(async () => {
        throw new Error('Failed to save');
      });
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() =>
        result.current.tableProps.onCellChange('2', 'projectsHours', '3'),
      );
      await act(() => result.current.tableProps.onSave!());
      expect(result.current.saveError).not.toBeNull();

      act(() => result.current.tableProps.onDiscard!());

      expect(result.current.saveError).toBeNull();
      expect(cellsOf(result, '2').projectsHours).toBe('2.00');
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

    it('saves the edited notes with the coach’s saved settings, then closes', async () => {
      const updateSettings = mockUpdateSettings(
        async ({ settings }) => settings,
      );
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() =>
        result.current.tableProps.onCellChange('2', 'projectsHours', '3'),
      );
      act(() => result.current.openNotes('2'));
      act(() => result.current.notesPanel.setDraft('Back from leave in May'));
      await act(() => result.current.notesPanel.save());

      expect(updateSettings).toHaveBeenCalledExactlyOnceWith({
        coachId: 2,
        settings: {
          groupSessionsPerWeek: 2,
          projectsHours: 2,
          internalTimeHours: 0.5,
          teamMeetingHours: 1,
          desiredHours: 20,
          notes: 'Back from leave in May',
        },
      });
      expect(result.current.notesPanel.coachName).toBeNull();
      expect(result.current.tableProps.dirtyRowIds).toEqual(new Set(['2']));
    });

    it('stays open with the draft and an error when the save fails', async () => {
      mockUpdateSettings(async () => {
        throw new Error('Failed to save');
      });
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
    });

    it('closes without saving', () => {
      const updateSettings = mockUpdateSettings(
        async ({ settings }) => settings,
      );
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
        { ...coachRow(1, 'Mostly Booked', 90), countedMemberships: [] },
        {
          ...coachRow(2, 'Lightly Booked', 15),
          countedMemberships: [membership],
        },
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
      showReport([
        { ...coachRow(1, 'Mostly Booked', 90), countedMemberships: [] },
      ]);
      const { result } = renderHook(() => useCoachCapacityReport());

      act(() => result.current.openDrilldown('1'));

      expect(result.current.drilldown.coachName).toBe('Mostly Booked');
      expect(result.current.drilldown.memberships).toEqual([]);
    });

    it('shows the refetched memberships of the open coach', () => {
      showReport([
        { ...coachRow(1, 'Mostly Booked', 90), countedMemberships: [] },
      ]);
      const { result, rerender } = renderHook(() => useCoachCapacityReport());
      act(() => result.current.openDrilldown('1'));

      showReport([
        {
          ...coachRow(1, 'Mostly Booked', 90),
          countedMemberships: [membership],
        },
      ]);
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
