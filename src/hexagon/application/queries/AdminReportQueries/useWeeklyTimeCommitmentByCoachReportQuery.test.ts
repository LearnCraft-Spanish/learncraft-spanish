import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useWeeklyTimeCommitmentByCoachReportQuery } from '@application/queries/AdminReportQueries/useWeeklyTimeCommitmentByCoachReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockWeeklyTimeCommitmentByCoachList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useWeeklyTimeCommitmentByCoachReportQuery', () => {
  it('should fetch weekly time commitment grouped by coach', async () => {
    const mockData = createMockWeeklyTimeCommitmentByCoachList(2);
    overrideMockAdminReportsAdapter({
      getWeeklyTimeCommitmentByCoachReport: async () => mockData,
    });

    const { result } = renderHook(
      () => useWeeklyTimeCommitmentByCoachReportQuery(),
      { wrapper: TestQueryClientProvider },
    );

    expect(
      result.current.weeklyTimeCommitmentByCoachReportQuery.isLoading,
    ).toBe(true);

    await waitFor(() =>
      expect(
        result.current.weeklyTimeCommitmentByCoachReportQuery.isLoading,
      ).toBe(false),
    );
    expect(
      result.current.weeklyTimeCommitmentByCoachReportQuery.isSuccess,
    ).toBe(true);
    expect(result.current.weeklyTimeCommitmentByCoachReportQuery.data).toEqual(
      mockData,
    );
  });

  it('should return empty array when no coaches have time commitments', async () => {
    overrideMockAdminReportsAdapter({
      getWeeklyTimeCommitmentByCoachReport: async () => [],
    });

    const { result } = renderHook(
      () => useWeeklyTimeCommitmentByCoachReportQuery(),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() =>
      expect(
        result.current.weeklyTimeCommitmentByCoachReportQuery.isLoading,
      ).toBe(false),
    );
    expect(result.current.weeklyTimeCommitmentByCoachReportQuery.data).toEqual(
      [],
    );
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getWeeklyTimeCommitmentByCoachReport: async () => {
        throw new Error('Failed to fetch weekly time commitment report');
      },
    });

    const { result } = renderHook(
      () => useWeeklyTimeCommitmentByCoachReportQuery(),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() =>
      expect(
        result.current.weeklyTimeCommitmentByCoachReportQuery.isLoading,
      ).toBe(false),
    );
    expect(result.current.weeklyTimeCommitmentByCoachReportQuery.isError).toBe(
      true,
    );
    expect(
      result.current.weeklyTimeCommitmentByCoachReportQuery.data,
    ).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(
      () => useWeeklyTimeCommitmentByCoachReportQuery(),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() =>
      expect(
        result.current.weeklyTimeCommitmentByCoachReportQuery.isLoading,
      ).toBe(false),
    );
    expect(result.current.weeklyTimeCommitmentByCoachReportQuery.status).toBe(
      'pending',
    );
    expect(
      result.current.weeklyTimeCommitmentByCoachReportQuery.data,
    ).toBeUndefined();
  });
});
