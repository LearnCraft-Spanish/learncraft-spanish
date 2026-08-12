import { overrideMockAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useLeadsToReEngageReportQuery } from '@application/queries/AdminReportQueries/useLeadsToReEngageReportQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockLeadsToReEngageList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useLeadsToReEngageReportQuery', () => {
  it('should fetch leads to re-engage grouped by coach', async () => {
    const mockData = createMockLeadsToReEngageList(2);
    overrideMockAdminReportsAdapter({
      getLeadsToReEngageReport: async () => mockData,
    });

    const { result } = renderHook(() => useLeadsToReEngageReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.leadsToReEngageReportQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.leadsToReEngageReportQuery.isLoading).toBe(false),
    );
    expect(result.current.leadsToReEngageReportQuery.isSuccess).toBe(true);
    expect(result.current.leadsToReEngageReportQuery.data).toEqual(mockData);
  });

  it('should return empty array when no coaches have leads to re-engage', async () => {
    overrideMockAdminReportsAdapter({
      getLeadsToReEngageReport: async () => [],
    });

    const { result } = renderHook(() => useLeadsToReEngageReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.leadsToReEngageReportQuery.isLoading).toBe(false),
    );
    expect(result.current.leadsToReEngageReportQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getLeadsToReEngageReport: async () => {
        throw new Error('Failed to fetch leads to re-engage report');
      },
    });

    const { result } = renderHook(() => useLeadsToReEngageReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.leadsToReEngageReportQuery.isLoading).toBe(false),
    );
    expect(result.current.leadsToReEngageReportQuery.isError).toBe(true);
    expect(result.current.leadsToReEngageReportQuery.data).toBeUndefined();
  });

  it('should not fetch when user is not admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(() => useLeadsToReEngageReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.leadsToReEngageReportQuery.isLoading).toBe(false),
    );
    expect(result.current.leadsToReEngageReportQuery.status).toBe('pending');
    expect(result.current.leadsToReEngageReportQuery.data).toBeUndefined();
  });
});
