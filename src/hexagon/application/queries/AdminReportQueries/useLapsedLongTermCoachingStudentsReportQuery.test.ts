import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useLapsedLongTermCoachingStudentsReportQuery } from '@application/queries/AdminReportQueries/useLapsedLongTermCoachingStudentsReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockLapsedLongTermCoachingStudentList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useLapsedLongTermCoachingStudentsReportQuery', () => {
  it('fetches lapsed long-term coaching students', async () => {
    const mockData = createMockLapsedLongTermCoachingStudentList(2);
    overrideMockAdminReportsAdapter({
      getLapsedLongTermCoachingStudentsReport: async () => mockData,
    });

    const { result } = renderHook(
      () => useLapsedLongTermCoachingStudentsReportQuery(),
      { wrapper: TestQueryClientProvider },
    );

    expect(
      result.current.lapsedLongTermCoachingStudentsReportQuery.isLoading,
    ).toBe(true);

    await waitFor(() =>
      expect(
        result.current.lapsedLongTermCoachingStudentsReportQuery.isLoading,
      ).toBe(false),
    );
    expect(
      result.current.lapsedLongTermCoachingStudentsReportQuery.isSuccess,
    ).toBe(true);
    expect(
      result.current.lapsedLongTermCoachingStudentsReportQuery.data,
    ).toEqual(mockData);
  });

  it('returns an empty array when no students qualify', async () => {
    overrideMockAdminReportsAdapter({
      getLapsedLongTermCoachingStudentsReport: async () => [],
    });

    const { result } = renderHook(
      () => useLapsedLongTermCoachingStudentsReportQuery(),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() =>
      expect(
        result.current.lapsedLongTermCoachingStudentsReportQuery.isLoading,
      ).toBe(false),
    );
    expect(
      result.current.lapsedLongTermCoachingStudentsReportQuery.data,
    ).toEqual([]);
  });

  it('exposes error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getLapsedLongTermCoachingStudentsReport: async () => {
        throw new Error('Failed to fetch lapsed long-term coaching students');
      },
    });

    const { result } = renderHook(
      () => useLapsedLongTermCoachingStudentsReportQuery(),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() =>
      expect(
        result.current.lapsedLongTermCoachingStudentsReportQuery.isLoading,
      ).toBe(false),
    );
    expect(
      result.current.lapsedLongTermCoachingStudentsReportQuery.isError,
    ).toBe(true);
    expect(
      result.current.lapsedLongTermCoachingStudentsReportQuery.data,
    ).toBeUndefined();
  });

  it('does not fetch when the user is not an admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(
      () => useLapsedLongTermCoachingStudentsReportQuery(),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() =>
      expect(
        result.current.lapsedLongTermCoachingStudentsReportQuery.isLoading,
      ).toBe(false),
    );
    expect(
      result.current.lapsedLongTermCoachingStudentsReportQuery.status,
    ).toBe('pending');
    expect(
      result.current.lapsedLongTermCoachingStudentsReportQuery.data,
    ).toBeUndefined();
  });
});
