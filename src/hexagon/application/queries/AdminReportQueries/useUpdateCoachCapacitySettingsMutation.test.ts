import {
  mockAdminReportsAdapter,
  overrideMockAdminReportsAdapter,
} from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { useCoachCapacityTodayReportQuery } from '@application/queries/AdminReportQueries/useCoachCapacityTodayReportQuery';
import { useUpdateCoachCapacitySettingsMutation } from '@application/queries/AdminReportQueries/useUpdateCoachCapacitySettingsMutation';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  createMockCoachCapacityReportRowList,
  createMockCoachCapacitySettings,
} from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

function renderReportAndMutation() {
  return renderHook(
    () => ({
      ...useCoachCapacityTodayReportQuery(),
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

  it('refetches Coach Capacity: Today before the save resolves', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () =>
        createMockCoachCapacityReportRowList(2),
    });
    const { result } = renderReportAndMutation();
    await waitFor(() =>
      expect(result.current.coachCapacityTodayReportQuery.isSuccess).toBe(true),
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
  });

  it('exposes the error and does not refetch when the save fails', async () => {
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () =>
        createMockCoachCapacityReportRowList(2),
      updateCoachCapacitySettings: async () => {
        throw new Error('Failed to save Coach Capacity settings');
      },
    });
    const { result } = renderReportAndMutation();
    await waitFor(() =>
      expect(result.current.coachCapacityTodayReportQuery.isSuccess).toBe(true),
    );

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
  });
});
