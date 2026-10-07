import type { CoachCapacityPeriod } from '@domain/functions/coachCapacity';
import {
  mockAdminReportsAdapter,
  overrideMockAdminReportsAdapter,
} from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useCoachCapacityReportQuery } from '@application/queries/AdminReportQueries/useCoachCapacityReportQuery';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockCoachCapacityReportRowList } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import React from 'react';
import { describe, expect, it } from 'vitest';

const reports = [
  {
    period: 'today',
    name: 'Coach Capacity: Today',
    fetch: 'getCoachCapacityTodayReport',
    otherFetch: 'getCoachCapacityTwoWeeksOutReport',
  },
  {
    period: 'twoWeeksOut',
    name: 'Coach Capacity: Two Weeks Out',
    fetch: 'getCoachCapacityTwoWeeksOutReport',
    otherFetch: 'getCoachCapacityTodayReport',
  },
] as const;

describe.each(reports)(
  'useCoachCapacityReportQuery for $name',
  ({ period, name, fetch, otherFetch }) => {
    it(`fetches ${name} and nothing else`, async () => {
      const mockData = createMockCoachCapacityReportRowList(2);
      overrideMockAdminReportsAdapter({ [fetch]: async () => mockData });

      const { result } = renderHook(() => useCoachCapacityReportQuery(period), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.coachCapacityReportQuery.isLoading).toBe(true);
      await waitFor(() =>
        expect(result.current.coachCapacityReportQuery.isSuccess).toBe(true),
      );
      expect(result.current.coachCapacityReportQuery.data).toEqual(mockData);
      expect(mockAdminReportsAdapter[fetch]).toHaveBeenCalledTimes(1);
      expect(mockAdminReportsAdapter[otherFetch]).not.toHaveBeenCalled();
    });

    it('exposes error state when the fetch fails', async () => {
      overrideMockAdminReportsAdapter({
        [fetch]: async () => {
          throw new Error('Failed to fetch Coach Capacity');
        },
      });

      const { result } = renderHook(() => useCoachCapacityReportQuery(period), {
        wrapper: TestQueryClientProvider,
      });

      await waitFor(() =>
        expect(result.current.coachCapacityReportQuery.isError).toBe(true),
      );
      expect(result.current.coachCapacityReportQuery.data).toBeUndefined();
    });

    it('does not fetch when the user is not an admin', async () => {
      overrideMockAuthAdapter({ isAdmin: false });

      const { result } = renderHook(() => useCoachCapacityReportQuery(period), {
        wrapper: TestQueryClientProvider,
      });

      await waitFor(() =>
        expect(result.current.coachCapacityReportQuery.isLoading).toBe(false),
      );
      expect(result.current.coachCapacityReportQuery.status).toBe('pending');
      expect(mockAdminReportsAdapter[fetch]).not.toHaveBeenCalled();
    });

    it('refetches every time it mounts, even when the app caches queries forever', async () => {
      overrideMockAdminReportsAdapter({
        [fetch]: async () => createMockCoachCapacityReportRowList(1),
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

      const firstOpen = renderHook(() => useCoachCapacityReportQuery(period), {
        wrapper,
      });
      await waitFor(() =>
        expect(
          firstOpen.result.current.coachCapacityReportQuery.isSuccess,
        ).toBe(true),
      );
      firstOpen.unmount();

      const secondOpen = renderHook(() => useCoachCapacityReportQuery(period), {
        wrapper,
      });
      await waitFor(() =>
        expect(
          secondOpen.result.current.coachCapacityReportQuery.isFetching,
        ).toBe(false),
      );

      expect(mockAdminReportsAdapter[fetch]).toHaveBeenCalledTimes(2);
      appLikeQueryClient.clear();
    });
  },
);

describe('useCoachCapacityReportQuery across periods', () => {
  it('keeps each period’s report separate when both are open', async () => {
    const todayData = createMockCoachCapacityReportRowList(1);
    const twoWeeksOutData = createMockCoachCapacityReportRowList(3);
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => todayData,
      getCoachCapacityTwoWeeksOutReport: async () => twoWeeksOutData,
    });

    const { result } = renderHook(
      () => ({
        today: useCoachCapacityReportQuery('today'),
        twoWeeksOut: useCoachCapacityReportQuery('twoWeeksOut'),
      }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.today.coachCapacityReportQuery.isSuccess).toBe(
        true,
      );
      expect(
        result.current.twoWeeksOut.coachCapacityReportQuery.isSuccess,
      ).toBe(true);
    });
    expect(result.current.today.coachCapacityReportQuery.data).toEqual(
      todayData,
    );
    expect(result.current.twoWeeksOut.coachCapacityReportQuery.data).toEqual(
      twoWeeksOutData,
    );
  });

  it('refetches when it is given a different period', async () => {
    const todayData = createMockCoachCapacityReportRowList(1);
    const twoWeeksOutData = createMockCoachCapacityReportRowList(3);
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => todayData,
      getCoachCapacityTwoWeeksOutReport: async () => twoWeeksOutData,
    });

    const { result, rerender } = renderHook(
      ({ period }: { period: CoachCapacityPeriod }) =>
        useCoachCapacityReportQuery(period),
      {
        wrapper: TestQueryClientProvider,
        initialProps: { period: 'today' },
      },
    );
    await waitFor(() =>
      expect(result.current.coachCapacityReportQuery.data).toEqual(todayData),
    );

    rerender({ period: 'twoWeeksOut' });

    await waitFor(() =>
      expect(result.current.coachCapacityReportQuery.data).toEqual(
        twoWeeksOutData,
      ),
    );
  });
});
