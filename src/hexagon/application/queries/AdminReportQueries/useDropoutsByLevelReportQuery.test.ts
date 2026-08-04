import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useDropoutsByLevelReportQuery } from '@application/queries/AdminReportQueries/useDropoutsByLevelReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockActiveMembershipsByCourseList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useDropoutsByLevelReportQuery', () => {
  it('should fetch dropouts grouped by level', async () => {
    const mockData = createMockActiveMembershipsByCourseList(2);
    overrideMockAdminReportsAdapter({
      getDropoutsByLevelReport: async () => mockData,
    });

    const { result } = renderHook(() => useDropoutsByLevelReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.dropoutsByLevelReportQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.dropoutsByLevelReportQuery.isLoading).toBe(false),
    );
    expect(result.current.dropoutsByLevelReportQuery.isSuccess).toBe(true);
    expect(result.current.dropoutsByLevelReportQuery.data).toEqual(mockData);
  });

  it('should return empty array when no courses have dropouts', async () => {
    overrideMockAdminReportsAdapter({
      getDropoutsByLevelReport: async () => [],
    });

    const { result } = renderHook(() => useDropoutsByLevelReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.dropoutsByLevelReportQuery.isLoading).toBe(false),
    );
    expect(result.current.dropoutsByLevelReportQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getDropoutsByLevelReport: async () => {
        throw new Error('Failed to fetch dropouts by level report');
      },
    });

    const { result } = renderHook(() => useDropoutsByLevelReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.dropoutsByLevelReportQuery.isLoading).toBe(false),
    );
    expect(result.current.dropoutsByLevelReportQuery.isError).toBe(true);
    expect(result.current.dropoutsByLevelReportQuery.data).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(() => useDropoutsByLevelReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.dropoutsByLevelReportQuery.isLoading).toBe(false),
    );
    expect(result.current.dropoutsByLevelReportQuery.status).toBe('pending');
    expect(result.current.dropoutsByLevelReportQuery.data).toBeUndefined();
  });
});
