import {
  mockAdminReportsAdapter,
  overrideMockAdminReportsAdapter,
} from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useCoachCapacityTodayReportQuery } from '@application/queries/AdminReportQueries/useCoachCapacityTodayReportQuery';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockCoachCapacityReportRowList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import React from 'react';
import { describe, expect, it } from 'vitest';

describe('useCoachCapacityTodayReportQuery', () => {
  it('fetches Coach Capacity: Today', async () => {
    const mockData = createMockCoachCapacityReportRowList(2);
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => mockData,
    });

    const { result } = renderHook(() => useCoachCapacityTodayReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.coachCapacityTodayReportQuery.isLoading).toBe(true);
    await waitFor(() =>
      expect(result.current.coachCapacityTodayReportQuery.isSuccess).toBe(true),
    );
    expect(result.current.coachCapacityTodayReportQuery.data).toEqual(mockData);
  });

  it('exposes error state when the fetch fails', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => {
        throw new Error('Failed to fetch Coach Capacity');
      },
    });

    const { result } = renderHook(() => useCoachCapacityTodayReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.coachCapacityTodayReportQuery.isError).toBe(true),
    );
    expect(result.current.coachCapacityTodayReportQuery.data).toBeUndefined();
  });

  it('does not fetch when the user is not an admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });

    const { result } = renderHook(() => useCoachCapacityTodayReportQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.coachCapacityTodayReportQuery.isLoading).toBe(
        false,
      ),
    );
    expect(result.current.coachCapacityTodayReportQuery.status).toBe('pending');
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).not.toHaveBeenCalled();
  });

  it('refetches every time it mounts, even when the app caches queries forever', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () =>
        createMockCoachCapacityReportRowList(1),
    });
    const appLikeQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        QueryClientProvider,
        { client: appLikeQueryClient },
        children,
      );

    const firstOpen = renderHook(() => useCoachCapacityTodayReportQuery(), {
      wrapper,
    });
    await waitFor(() =>
      expect(
        firstOpen.result.current.coachCapacityTodayReportQuery.isSuccess,
      ).toBe(true),
    );
    firstOpen.unmount();

    const secondOpen = renderHook(() => useCoachCapacityTodayReportQuery(), {
      wrapper,
    });
    await waitFor(() =>
      expect(
        secondOpen.result.current.coachCapacityTodayReportQuery.isFetching,
      ).toBe(false),
    );

    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledTimes(2);
    appLikeQueryClient.clear();
  });
});
