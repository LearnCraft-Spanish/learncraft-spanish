import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useGroupCallsByCoachReportQuery } from '@application/queries/AdminReportQueries/useGroupCallsByCoachReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockGroupCallsByCoachList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useGroupCallsByCoachReportQuery', () => {
  it('should fetch group calls by coach report', async () => {
    const mockData = createMockGroupCallsByCoachList(2);
    overrideMockAdminReportsAdapter({
      getGroupCallsByCoachReport: async () => mockData,
    });

    const { result } = renderHook(() => useGroupCallsByCoachReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.groupCallsByCoachReportQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.groupCallsByCoachReportQuery.isLoading).toBe(false),
    );
    expect(result.current.groupCallsByCoachReportQuery.isSuccess).toBe(true);
    expect(result.current.groupCallsByCoachReportQuery.data).toEqual(mockData);
  });

  it('should return empty array when there are no group calls', async () => {
    overrideMockAdminReportsAdapter({
      getGroupCallsByCoachReport: async () => [],
    });

    const { result } = renderHook(() => useGroupCallsByCoachReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.groupCallsByCoachReportQuery.isLoading).toBe(false),
    );
    expect(result.current.groupCallsByCoachReportQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getGroupCallsByCoachReport: async () => {
        throw new Error('Failed to fetch group calls by coach report');
      },
    });

    const { result } = renderHook(() => useGroupCallsByCoachReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.groupCallsByCoachReportQuery.isLoading).toBe(false),
    );
    expect(result.current.groupCallsByCoachReportQuery.isError).toBe(true);
    expect(result.current.groupCallsByCoachReportQuery.data).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(() => useGroupCallsByCoachReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.groupCallsByCoachReportQuery.isLoading).toBe(false),
    );
    expect(result.current.groupCallsByCoachReportQuery.status).toBe('pending');
    expect(result.current.groupCallsByCoachReportQuery.data).toBeUndefined();
  });
});
