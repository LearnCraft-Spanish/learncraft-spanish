import type { CoachCapacityPeriod } from '@domain/functions/coachCapacity';
import {
  mockAdminReportsAdapter,
  overrideMockAdminReportsAdapter,
} from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { useCoachCapacityReportQuery } from '@application/queries/AdminReportQueries/useCoachCapacityReportQuery';
import { useUpdateCoachCapacitySettingsMutation } from '@application/queries/AdminReportQueries/useUpdateCoachCapacitySettingsMutation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  createMockCoachCapacityReportRowList,
  createMockCoachCapacitySettings,
} from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import React from 'react';
import { describe, expect, it } from 'vitest';

function serveReports(): void {
  overrideMockAdminReportsAdapter({
    getCoachCapacityTodayReport: async () =>
      createMockCoachCapacityReportRowList(2),
    getCoachCapacityTwoWeeksOutReport: async () =>
      createMockCoachCapacityReportRowList(2),
  });
}

function renderBothReportsAndMutation() {
  return renderHook(
    () => ({
      today: useCoachCapacityReportQuery('today'),
      twoWeeksOut: useCoachCapacityReportQuery('twoWeeksOut'),
      ...useUpdateCoachCapacitySettingsMutation(),
    }),
    { wrapper: TestQueryClientProvider },
  );
}

describe('useUpdateCoachCapacitySettingsMutation', () => {
  it('sends the coach and their full settings to the adapter', async () => {
    const settings = createMockCoachCapacitySettings({
      groupSessionsPerWeek: 2,
      projectsHours: 1.25,
      desiredHours: null,
      notes: 'Away in July',
    });

    const { result } = renderHook(
      () => useUpdateCoachCapacitySettingsMutation(),
      { wrapper: TestQueryClientProvider },
    );

    const saved = await act(() =>
      result.current.updateCoachCapacitySettingsMutation.mutateAsync({
        coachId: 7,
        settings,
      }),
    );

    expect(
      mockAdminReportsAdapter.updateCoachCapacitySettings,
    ).toHaveBeenCalledWith({ coachId: 7, settings });
    expect(saved).toEqual(settings);
  });

  it('refetches both Coach Capacity reports before the save resolves', async () => {
    serveReports();
    const { result } = renderBothReportsAndMutation();
    await waitFor(() => {
      expect(result.current.today.coachCapacityReportQuery.isSuccess).toBe(
        true,
      );
      expect(
        result.current.twoWeeksOut.coachCapacityReportQuery.isSuccess,
      ).toBe(true);
    });

    await act(() =>
      result.current.updateCoachCapacitySettingsMutation.mutateAsync({
        coachId: 7,
        settings: createMockCoachCapacitySettings(),
      }),
    );

    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledTimes(2);
    expect(
      mockAdminReportsAdapter.getCoachCapacityTwoWeeksOutReport,
    ).toHaveBeenCalledTimes(2);
  });

  it('does not fetch a report that is not open', async () => {
    serveReports();
    const { result } = renderHook(
      () => ({
        today: useCoachCapacityReportQuery('today'),
        ...useUpdateCoachCapacitySettingsMutation(),
      }),
      { wrapper: TestQueryClientProvider },
    );
    await waitFor(() =>
      expect(result.current.today.coachCapacityReportQuery.isSuccess).toBe(
        true,
      ),
    );

    await act(() =>
      result.current.updateCoachCapacitySettingsMutation.mutateAsync({
        coachId: 7,
        settings: createMockCoachCapacitySettings(),
      }),
    );

    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledTimes(2);
    expect(
      mockAdminReportsAdapter.getCoachCapacityTwoWeeksOutReport,
    ).not.toHaveBeenCalled();
  });

  it('drops a cached report that is not open, so switching to it loads the saved values', async () => {
    serveReports();
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
    const { result, rerender } = renderHook(
      ({ period }: { period: CoachCapacityPeriod }) => ({
        report: useCoachCapacityReportQuery(period),
        ...useUpdateCoachCapacitySettingsMutation(),
      }),
      { wrapper, initialProps: { period: 'twoWeeksOut' } },
    );
    await waitFor(() =>
      expect(result.current.report.coachCapacityReportQuery.isSuccess).toBe(
        true,
      ),
    );
    rerender({ period: 'today' });
    await waitFor(() =>
      expect(result.current.report.coachCapacityReportQuery.isSuccess).toBe(
        true,
      ),
    );

    await act(() =>
      result.current.updateCoachCapacitySettingsMutation.mutateAsync({
        coachId: 7,
        settings: createMockCoachCapacitySettings(),
      }),
    );
    expect(
      mockAdminReportsAdapter.getCoachCapacityTwoWeeksOutReport,
    ).toHaveBeenCalledTimes(1);

    rerender({ period: 'twoWeeksOut' });
    expect(result.current.report.coachCapacityReportQuery.data).toBeUndefined();
    await waitFor(() =>
      expect(result.current.report.coachCapacityReportQuery.isSuccess).toBe(
        true,
      ),
    );
    expect(
      mockAdminReportsAdapter.getCoachCapacityTwoWeeksOutReport,
    ).toHaveBeenCalledTimes(2);
    appLikeQueryClient.clear();
  });

  it('still resolves the save when a report fails to refetch', async () => {
    let twoWeeksOutFetches = 0;
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () =>
        createMockCoachCapacityReportRowList(2),
      getCoachCapacityTwoWeeksOutReport: async () => {
        twoWeeksOutFetches += 1;
        if (twoWeeksOutFetches > 1) {
          throw new Error('Failed to fetch Coach Capacity');
        }
        return createMockCoachCapacityReportRowList(2);
      },
    });
    const { result } = renderBothReportsAndMutation();
    await waitFor(() => {
      expect(result.current.today.coachCapacityReportQuery.isSuccess).toBe(
        true,
      );
      expect(
        result.current.twoWeeksOut.coachCapacityReportQuery.isSuccess,
      ).toBe(true);
    });
    const settings = createMockCoachCapacitySettings();

    const saved = await act(() =>
      result.current.updateCoachCapacitySettingsMutation.mutateAsync({
        coachId: 7,
        settings,
      }),
    );

    expect(saved).toEqual(settings);
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledTimes(2);
  });

  it('exposes the error and refetches neither report when the save fails', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () =>
        createMockCoachCapacityReportRowList(2),
      getCoachCapacityTwoWeeksOutReport: async () =>
        createMockCoachCapacityReportRowList(2),
      updateCoachCapacitySettings: async () => {
        throw new Error('Failed to save Coach Capacity settings');
      },
    });
    const { result } = renderBothReportsAndMutation();
    await waitFor(() => {
      expect(result.current.today.coachCapacityReportQuery.isSuccess).toBe(
        true,
      );
      expect(
        result.current.twoWeeksOut.coachCapacityReportQuery.isSuccess,
      ).toBe(true);
    });

    await act(async () => {
      await expect(
        result.current.updateCoachCapacitySettingsMutation.mutateAsync({
          coachId: 7,
          settings: createMockCoachCapacitySettings(),
        }),
      ).rejects.toThrow('Failed to save Coach Capacity settings');
    });

    await waitFor(() =>
      expect(result.current.updateCoachCapacitySettingsMutation.isError).toBe(
        true,
      ),
    );
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockAdminReportsAdapter.getCoachCapacityTwoWeeksOutReport,
    ).toHaveBeenCalledTimes(1);
  });
});
