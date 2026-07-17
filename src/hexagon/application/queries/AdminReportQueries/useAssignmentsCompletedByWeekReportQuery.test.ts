import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useAssignmentsCompletedByWeekReportQuery } from '@application/queries/AdminReportQueries/useAssignmentsCompletedByWeekReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockAssignmentsCompletedByWeekList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useAssignmentsCompletedByWeekReportQuery', () => {
  it('should fetch assignments completed by week grouped by course', async () => {
    const mockData = createMockAssignmentsCompletedByWeekList(2);
    overrideMockAdminReportsAdapter({
      getAssignmentsCompletedByWeekReport: async () => mockData,
    });

    const { result } = renderHook(
      () => useAssignmentsCompletedByWeekReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    expect(result.current.assignmentsCompletedByWeekReportQuery.isLoading).toBe(
      true,
    );

    await waitFor(() =>
      expect(
        result.current.assignmentsCompletedByWeekReportQuery.isLoading,
      ).toBe(false),
    );
    expect(result.current.assignmentsCompletedByWeekReportQuery.isSuccess).toBe(
      true,
    );
    expect(result.current.assignmentsCompletedByWeekReportQuery.data).toEqual(
      [...mockData].sort((a, b) => a.courseName.localeCompare(b.courseName)),
    );
  });

  it('should return empty array when no courses have assignments', async () => {
    overrideMockAdminReportsAdapter({
      getAssignmentsCompletedByWeekReport: async () => [],
    });

    const { result } = renderHook(
      () => useAssignmentsCompletedByWeekReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.assignmentsCompletedByWeekReportQuery.isLoading,
      ).toBe(false),
    );
    expect(result.current.assignmentsCompletedByWeekReportQuery.data).toEqual(
      [],
    );
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getAssignmentsCompletedByWeekReport: async () => {
        throw new Error('Failed to fetch assignments completed by week report');
      },
    });

    const { result } = renderHook(
      () => useAssignmentsCompletedByWeekReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.assignmentsCompletedByWeekReportQuery.isLoading,
      ).toBe(false),
    );
    expect(result.current.assignmentsCompletedByWeekReportQuery.isError).toBe(
      true,
    );
    expect(
      result.current.assignmentsCompletedByWeekReportQuery.data,
    ).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(
      () => useAssignmentsCompletedByWeekReportQuery(),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.assignmentsCompletedByWeekReportQuery.isLoading,
      ).toBe(false),
    );
    expect(result.current.assignmentsCompletedByWeekReportQuery.status).toBe(
      'pending',
    );
    expect(
      result.current.assignmentsCompletedByWeekReportQuery.data,
    ).toBeUndefined();
  });
});
