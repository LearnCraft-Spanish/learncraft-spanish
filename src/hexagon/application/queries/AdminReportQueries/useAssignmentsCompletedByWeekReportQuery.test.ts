import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useAssignmentsCompletedByWeekReportQuery } from '@application/queries/AdminReportQueries/useAssignmentsCompletedByWeekReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockAssignmentsCompletedByWeekList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it, vi } from 'vitest';

const WEEK_STARTS = '2026-07-12';

describe('useAssignmentsCompletedByWeekReportQuery', () => {
  it('should fetch assignments completed by week for the given weekStarts', async () => {
    const mockData = createMockAssignmentsCompletedByWeekList(2);
    const getReport = vi.fn(async () => mockData);
    overrideMockAdminReportsAdapter({
      getAssignmentsCompletedByWeekReport: getReport,
    });

    const { result } = renderHook(
      () => useAssignmentsCompletedByWeekReportQuery(WEEK_STARTS),
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
    expect(getReport).toHaveBeenCalledWith(WEEK_STARTS);
    expect(result.current.assignmentsCompletedByWeekReportQuery.data).toEqual(
      [...mockData].sort((a, b) => a.courseName.localeCompare(b.courseName)),
    );
  });

  it('should return empty array when no courses have assignments', async () => {
    overrideMockAdminReportsAdapter({
      getAssignmentsCompletedByWeekReport: async () => [],
    });

    const { result } = renderHook(
      () => useAssignmentsCompletedByWeekReportQuery(WEEK_STARTS),
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
      () => useAssignmentsCompletedByWeekReportQuery(WEEK_STARTS),
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
      () => useAssignmentsCompletedByWeekReportQuery(WEEK_STARTS),
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

  it('should not fetch when weekStarts is empty', async () => {
    const getReport = vi.fn(async () => []);
    overrideMockAdminReportsAdapter({
      getAssignmentsCompletedByWeekReport: getReport,
    });

    const { result } = renderHook(
      () => useAssignmentsCompletedByWeekReportQuery(''),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(
        result.current.assignmentsCompletedByWeekReportQuery.isLoading,
      ).toBe(false),
    );
    expect(getReport).not.toHaveBeenCalled();
  });
});
