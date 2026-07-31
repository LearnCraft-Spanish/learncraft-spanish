import type { WeeksDrilldownReportName } from '@application/ports/AdminReports/adminReportsPort';
import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useWeeksDrilldownReportQuery } from '@application/queries/AdminReportQueries/useWeeksDrilldownReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockCoachSummaryDrilldownList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it, vi } from 'vitest';

const COACH_NAME = 'Jane Smith';
const REPORT: WeeksDrilldownReportName = 'Weekly Coach Summary';

describe('useWeeksDrilldownReportQuery', () => {
  it('should fetch weeks drilldown report for the given coach and report', async () => {
    const mockData = createMockCoachSummaryDrilldownList(2);
    const getReport = vi.fn(async () => mockData);
    overrideMockAdminReportsAdapter({
      getWeeksDrilldownReport: getReport,
    });

    const { result } = renderHook(
      () => useWeeksDrilldownReportQuery(COACH_NAME, REPORT),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    expect(result.current.weeksDrilldownReportQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.weeksDrilldownReportQuery.isLoading).toBe(false),
    );
    expect(result.current.weeksDrilldownReportQuery.isSuccess).toBe(true);
    expect(getReport).toHaveBeenCalledWith(COACH_NAME, REPORT);
    expect(result.current.weeksDrilldownReportQuery.data).toEqual(mockData);
  });

  it('should return empty array when there are no drilldown records', async () => {
    overrideMockAdminReportsAdapter({
      getWeeksDrilldownReport: async () => [],
    });

    const { result } = renderHook(
      () => useWeeksDrilldownReportQuery(COACH_NAME, REPORT),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(result.current.weeksDrilldownReportQuery.isLoading).toBe(false),
    );
    expect(result.current.weeksDrilldownReportQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getWeeksDrilldownReport: async () => {
        throw new Error('Failed to fetch weeks drilldown report');
      },
    });

    const { result } = renderHook(
      () => useWeeksDrilldownReportQuery(COACH_NAME, REPORT),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(result.current.weeksDrilldownReportQuery.isLoading).toBe(false),
    );
    expect(result.current.weeksDrilldownReportQuery.isError).toBe(true);
    expect(result.current.weeksDrilldownReportQuery.data).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(
      () => useWeeksDrilldownReportQuery(COACH_NAME, REPORT),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(result.current.weeksDrilldownReportQuery.isLoading).toBe(false),
    );
    expect(result.current.weeksDrilldownReportQuery.status).toBe('pending');
    expect(result.current.weeksDrilldownReportQuery.data).toBeUndefined();
  });

  it('should not fetch when coachName is empty', async () => {
    const getReport = vi.fn(async () => []);
    overrideMockAdminReportsAdapter({
      getWeeksDrilldownReport: getReport,
    });

    const { result } = renderHook(
      () => useWeeksDrilldownReportQuery('', REPORT),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() =>
      expect(result.current.weeksDrilldownReportQuery.isLoading).toBe(false),
    );
    expect(getReport).not.toHaveBeenCalled();
  });
});
