import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useLastWeekCoachSummaryReportQuery } from '@application/queries/AdminReportQueries/useLastWeekCoachSummaryReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockCoachSummaryList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useLastWeekCoachSummaryReportQuery', () => {
  it('should fetch last week coach summary report', async () => {
    const mockData = createMockCoachSummaryList(2);
    overrideMockAdminReportsAdapter({
      getLastWeekCoachSummaryReport: async () => mockData,
    });

    const { result } = renderHook(() => useLastWeekCoachSummaryReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.lastWeekCoachSummaryReportQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.lastWeekCoachSummaryReportQuery.isLoading).toBe(
        false,
      ),
    );
    expect(result.current.lastWeekCoachSummaryReportQuery.isSuccess).toBe(true);
    expect(result.current.lastWeekCoachSummaryReportQuery.data).toEqual(
      mockData,
    );
  });

  it('should return empty array when there are no last week summaries', async () => {
    overrideMockAdminReportsAdapter({
      getLastWeekCoachSummaryReport: async () => [],
    });

    const { result } = renderHook(() => useLastWeekCoachSummaryReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.lastWeekCoachSummaryReportQuery.isLoading).toBe(
        false,
      ),
    );
    expect(result.current.lastWeekCoachSummaryReportQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getLastWeekCoachSummaryReport: async () => {
        throw new Error('Failed to fetch last week coach summary report');
      },
    });

    const { result } = renderHook(() => useLastWeekCoachSummaryReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.lastWeekCoachSummaryReportQuery.isLoading).toBe(
        false,
      ),
    );
    expect(result.current.lastWeekCoachSummaryReportQuery.isError).toBe(true);
    expect(result.current.lastWeekCoachSummaryReportQuery.data).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(() => useLastWeekCoachSummaryReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.lastWeekCoachSummaryReportQuery.isLoading).toBe(
        false,
      ),
    );
    expect(result.current.lastWeekCoachSummaryReportQuery.status).toBe(
      'pending',
    );
    expect(result.current.lastWeekCoachSummaryReportQuery.data).toBeUndefined();
  });
});
