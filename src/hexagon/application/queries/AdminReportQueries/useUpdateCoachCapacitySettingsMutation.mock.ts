import type { UpdateCoachCapacitySettingsCommand } from '@application/ports/AdminReports/adminReportsPort';
import type { UseUpdateCoachCapacitySettingsMutationReturn } from '@application/queries/AdminReportQueries/useUpdateCoachCapacitySettingsMutation';
import type { CoachCapacitySettings } from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockImplementation: UseUpdateCoachCapacitySettingsMutationReturn =
  {
    updateCoachCapacitySettingsMutation: {
      data: undefined,
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      mutate: () => {},
      mutateAsync: async ({ settings }: UpdateCoachCapacitySettingsCommand) =>
        settings,
      reset: () => {},
      status: 'idle',
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
    } as unknown as UseMutationResult<
      CoachCapacitySettings,
      Error,
      UpdateCoachCapacitySettingsCommand
    >,
  };

export const {
  mock: mockUseUpdateCoachCapacitySettingsMutation,
  override: overrideMockUseUpdateCoachCapacitySettingsMutation,
  reset: resetMockUseUpdateCoachCapacitySettingsMutation,
} = createOverrideableMock<UseUpdateCoachCapacitySettingsMutationReturn>(
  defaultMockImplementation,
);
export default mockUseUpdateCoachCapacitySettingsMutation;
