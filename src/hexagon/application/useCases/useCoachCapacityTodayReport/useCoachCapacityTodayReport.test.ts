import type { CoachCapacityReportRow } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  mockUseCoachCapacityTodayReportQuery,
  overrideMockUseCoachCapacityTodayReportQuery,
  resetMockUseCoachCapacityTodayReportQuery,
} from '@application/queries/AdminReportQueries/useCoachCapacityTodayReportQuery.mock';
import { useCoachCapacityTodayReport } from '@application/useCases/useCoachCapacityTodayReport/useCoachCapacityTodayReport';
import { renderHook } from '@testing-library/react';
import {
  createMockCoachCapacityReportRow,
  createMockCoachCapacitySettings,
} from '@testing/factories/adminReportsFactory';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/queries/AdminReportQueries/useCoachCapacityTodayReportQuery',
  () => ({
    useCoachCapacityTodayReportQuery: () =>
      mockUseCoachCapacityTodayReportQuery,
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
): CoachCapacityReportRow {
  return createMockCoachCapacityReportRow({
    coach: { coach_id: coachId, fullName, email: 'coach@example.test' },
    settings: createMockCoachCapacitySettings({
      desiredHours: bookedPercent === null ? null : 20,
    }),
    bookedPercent,
  });
}

describe('useCoachCapacityTodayReport', () => {
  afterEach(() => {
    resetMockUseCoachCapacityTodayReportQuery();
  });

  it('returns one row per coach, least booked first', () => {
    overrideMockUseCoachCapacityTodayReportQuery({
      coachCapacityTodayReportQuery: queryResult({
        data: [
          coachRow(1, 'Mostly Booked', 90),
          coachRow(2, 'Lightly Booked', 15),
          coachRow(3, 'Not Set Up', null),
        ],
        isSuccess: true,
        status: 'success',
      }),
    });

    const { result } = renderHook(() => useCoachCapacityTodayReport());

    expect(result.current.rows.map((row) => row.id)).toEqual(['3', '2', '1']);
    expect(result.current.rows.map((row) => row.cells.bookedPercent)).toEqual([
      '—',
      '15%',
      '90%',
    ]);
  });

  it('defines the report columns in display order, all read-only', () => {
    const { result } = renderHook(() => useCoachCapacityTodayReport());

    expect(result.current.columns.map((column) => column.id)).toEqual([
      'coach',
      'coachingHours',
      'groupSessionsPerWeek',
      'projectsHours',
      'internalTimeHours',
      'teamMeetingHours',
      'committedHours',
      'desiredHours',
      'bookedPercent',
      'notes',
    ]);
    expect(
      result.current.columns.every((column) => column.editable === false),
    ).toBe(true);
  });

  it('returns no rows while the report is loading', () => {
    overrideMockUseCoachCapacityTodayReportQuery({
      coachCapacityTodayReportQuery: queryResult({ isLoading: true }),
    });

    const { result } = renderHook(() => useCoachCapacityTodayReport());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.rows).toEqual([]);
  });

  it('exposes the error state when the report fails to load', () => {
    overrideMockUseCoachCapacityTodayReportQuery({
      coachCapacityTodayReportQuery: queryResult({
        isError: true,
        status: 'error',
      }),
    });

    const { result } = renderHook(() => useCoachCapacityTodayReport());

    expect(result.current.isError).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.rows).toEqual([]);
  });
});
