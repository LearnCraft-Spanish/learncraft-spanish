import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useActiveMembershipsReportQuery } from '@application/queries/AdminReportQueries/useActiveMembershipsReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockActiveMembershipsByCourseList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useActiveMembershipsReportQuery', () => {
  it('should fetch active memberships grouped by course', async () => {
    const mockData = createMockActiveMembershipsByCourseList(2);
    overrideMockAdminReportsAdapter({
      getActiveMembershipsReport: async () => mockData,
    });

    const { result } = renderHook(() => useActiveMembershipsReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.activeMembershipsReportQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.activeMembershipsReportQuery.isLoading).toBe(false),
    );
    expect(result.current.activeMembershipsReportQuery.isSuccess).toBe(true);
    expect(result.current.activeMembershipsReportQuery.data).toEqual(mockData);
  });

  it('should return empty array when no courses have memberships', async () => {
    overrideMockAdminReportsAdapter({
      getActiveMembershipsReport: async () => [],
    });

    const { result } = renderHook(() => useActiveMembershipsReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.activeMembershipsReportQuery.isLoading).toBe(false),
    );
    expect(result.current.activeMembershipsReportQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getActiveMembershipsReport: async () => {
        throw new Error('Failed to fetch active memberships report');
      },
    });

    const { result } = renderHook(() => useActiveMembershipsReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.activeMembershipsReportQuery.isLoading).toBe(false),
    );
    expect(result.current.activeMembershipsReportQuery.isError).toBe(true);
    expect(result.current.activeMembershipsReportQuery.data).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(() => useActiveMembershipsReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.activeMembershipsReportQuery.isLoading).toBe(false),
    );
    expect(result.current.activeMembershipsReportQuery.status).toBe('pending');
    expect(result.current.activeMembershipsReportQuery.data).toBeUndefined();
  });
});
