import type { LapsedLongTermCoachingStudent } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useLapsedLongTermCoachingStudentsReportQuery } from '@application/queries/AdminReportQueries/useLapsedLongTermCoachingStudentsReportQuery';
import {
  mockUseLapsedLongTermCoachingStudentsReportQuery,
  overrideMockUseLapsedLongTermCoachingStudentsReportQuery,
  resetMockUseLapsedLongTermCoachingStudentsReportQuery,
} from '@application/queries/AdminReportQueries/useLapsedLongTermCoachingStudentsReportQuery.mock';
import { useLapsedLongTermCoachingStudentsReport } from '@application/useCases/useLapsedLongTermCoachingStudentsReport/useLapsedLongTermCoachingStudentsReport';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/queries/AdminReportQueries/useLapsedLongTermCoachingStudentsReportQuery',
  () => ({
    useLapsedLongTermCoachingStudentsReportQuery: vi.fn(
      () => mockUseLapsedLongTermCoachingStudentsReportQuery,
    ),
  }),
);

function queryResult(
  overrides: Partial<UseQueryResult<LapsedLongTermCoachingStudent[]>>,
): UseQueryResult<LapsedLongTermCoachingStudent[]> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    isSuccess: false,
    status: 'pending',
    ...overrides,
  } as UseQueryResult<LapsedLongTermCoachingStudent[]>;
}

const amy: LapsedLongTermCoachingStudent = {
  student_id: 2,
  fullName: 'Amy',
  email: 'amy@example.test',
  previousPrimaryCoach: 'Zed Coach',
  previousMemberships: [
    {
      courseName: 'Premier Coaching',
      startDate: '2023-01-01',
      endDate: '2024-10-01',
    },
  ],
};

const zoe: LapsedLongTermCoachingStudent = {
  student_id: 9,
  fullName: 'Zoe',
  email: 'zoe@example.test',
  previousPrimaryCoach: 'Ann Coach',
  previousMemberships: [
    {
      courseName: 'Regular Coaching',
      startDate: '2022-01-01',
      endDate: '2023-01-01',
    },
  ],
};

describe('useLapsedLongTermCoachingStudentsReport', () => {
  beforeEach(() => {
    resetMockUseLapsedLongTermCoachingStudentsReportQuery();
  });

  it('starts on newest membership first and narrows when a coach or membership type is chosen', () => {
    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: queryResult({
        data: [zoe, amy],
        isSuccess: true,
        status: 'success',
      }),
    });

    const { result } = renderHook(() =>
      useLapsedLongTermCoachingStudentsReport(),
    );

    expect(result.current.students.map((student) => student.fullName)).toEqual([
      'Amy',
      'Zoe',
    ]);
    expect(result.current.totalCount).toBe(2);
    expect(result.current.sort).toEqual({
      column: 'mostRecent',
      direction: 'descending',
    });

    act(() => result.current.setCoachFilter('Ann Coach'));
    expect(result.current.students.map((student) => student.fullName)).toEqual([
      'Zoe',
    ]);

    act(() =>
      result.current.setCoachFilter(result.current.coachOptions[0].value),
    );
    act(() => result.current.setMembershipTypeFilter(['Premier Coaching']));
    expect(result.current.students.map((student) => student.fullName)).toEqual([
      'Amy',
    ]);
  });

  it('narrows by a case-insensitive name or email search', () => {
    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: queryResult({
        data: [zoe, amy],
        isSuccess: true,
        status: 'success',
      }),
    });

    const { result } = renderHook(() =>
      useLapsedLongTermCoachingStudentsReport(),
    );
    expect(result.current.search).toBe('');

    act(() => result.current.setSearch('AMY'));
    expect(result.current.search).toBe('AMY');
    expect(result.current.students.map((student) => student.fullName)).toEqual([
      'Amy',
    ]);

    act(() => result.current.setSearch('zoe@example'));
    expect(result.current.students.map((student) => student.fullName)).toEqual([
      'Zoe',
    ]);
    expect(result.current.totalCount).toBe(2);
  });

  it('sorts by coach and flips the direction', () => {
    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: queryResult({
        data: [amy, zoe],
        isSuccess: true,
        status: 'success',
      }),
    });

    const { result } = renderHook(() =>
      useLapsedLongTermCoachingStudentsReport(),
    );

    act(() => result.current.setSortColumn('coach'));
    expect(result.current.sort).toEqual({
      column: 'coach',
      direction: 'ascending',
    });
    expect(result.current.students.map((student) => student.fullName)).toEqual([
      'Zoe',
      'Amy',
    ]);

    act(() => result.current.toggleSortDirection());
    expect(result.current.sort.direction).toBe('descending');
    expect(result.current.students.map((student) => student.fullName)).toEqual([
      'Amy',
      'Zoe',
    ]);
  });

  it('passes through loading and error without inventing students', () => {
    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: queryResult({
        isLoading: true,
        status: 'pending',
      }),
    });

    const loading = renderHook(() => useLapsedLongTermCoachingStudentsReport());
    expect(loading.result.current.isLoading).toBe(true);
    expect(loading.result.current.students).toEqual([]);
    loading.unmount();

    overrideMockUseLapsedLongTermCoachingStudentsReportQuery({
      lapsedLongTermCoachingStudentsReportQuery: queryResult({
        isError: true,
        status: 'error',
      }),
    });

    const { result } = renderHook(() =>
      useLapsedLongTermCoachingStudentsReport(),
    );
    expect(result.current.isError).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.students).toEqual([]);
    expect(useLapsedLongTermCoachingStudentsReportQuery).toHaveBeenCalled();
  });
});
