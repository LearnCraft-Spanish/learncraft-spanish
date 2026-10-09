import type {
  UpdateCoachCapacitySettingsVariables,
  UseUpdateCoachCapacitySettingsMutationReturn,
} from '@application/queries/AdminReportQueries/useUpdateCoachCapacitySettingsMutation';
import type { CoachCapacitySettings } from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { createMockCoachCapacitySettings } from '@testing/factories/adminReportsFactory';
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
      mutateAsync: async ({ changes }: UpdateCoachCapacitySettingsVariables) =>
        createMockCoachCapacitySettings(changes),
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
      UpdateCoachCapacitySettingsVariables
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
