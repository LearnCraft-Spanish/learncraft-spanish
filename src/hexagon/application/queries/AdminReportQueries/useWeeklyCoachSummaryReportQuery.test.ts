import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useWeeklyCoachSummaryReportQuery } from '@application/queries/AdminReportQueries/useWeeklyCoachSummaryReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockCoachSummaryList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useWeeklyCoachSummaryReportQuery', () => {
  it('should fetch weekly coach summary report', async () => {
    const mockData = createMockCoachSummaryList(2);
    overrideMockAdminReportsAdapter({
      getWeeklyCoachSummaryReport: async () => mockData,
    });

    const { result } = renderHook(() => useWeeklyCoachSummaryReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.weeklyCoachSummaryReportQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.weeklyCoachSummaryReportQuery.isLoading).toBe(
        false,
      ),
    );
    expect(result.current.weeklyCoachSummaryReportQuery.isSuccess).toBe(true);
    expect(result.current.weeklyCoachSummaryReportQuery.data).toEqual(mockData);
  });

  it('should return empty array when there are no weekly summaries', async () => {
    overrideMockAdminReportsAdapter({
      getWeeklyCoachSummaryReport: async () => [],
    });

    const { result } = renderHook(() => useWeeklyCoachSummaryReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.weeklyCoachSummaryReportQuery.isLoading).toBe(
        false,
      ),
    );
    expect(result.current.weeklyCoachSummaryReportQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getWeeklyCoachSummaryReport: async () => {
        throw new Error('Failed to fetch weekly coach summary report');
      },
    });

    const { result } = renderHook(() => useWeeklyCoachSummaryReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.weeklyCoachSummaryReportQuery.isLoading).toBe(
        false,
      ),
    );
    expect(result.current.weeklyCoachSummaryReportQuery.isError).toBe(true);
    expect(result.current.weeklyCoachSummaryReportQuery.data).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(() => useWeeklyCoachSummaryReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.weeklyCoachSummaryReportQuery.isLoading).toBe(
        false,
      ),
    );
    expect(result.current.weeklyCoachSummaryReportQuery.status).toBe('pending');
    expect(result.current.weeklyCoachSummaryReportQuery.data).toBeUndefined();
  });
});
