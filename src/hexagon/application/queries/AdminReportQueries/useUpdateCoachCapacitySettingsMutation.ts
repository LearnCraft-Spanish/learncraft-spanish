import type { UpdateCoachCapacitySettingsCommand } from '@application/ports/AdminReports/adminReportsPort';
import type { CoachCapacitySettings } from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { COACH_CAPACITY_TODAY_REPORT_QUERY_KEY } from '@application/queries/AdminReportQueries/useCoachCapacityTodayReportQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UseUpdateCoachCapacitySettingsMutationReturn {
  updateCoachCapacitySettingsMutation: UseMutationResult<
    CoachCapacitySettings,
    Error,
    UpdateCoachCapacitySettingsCommand
  >;
}

export function useUpdateCoachCapacitySettingsMutation(): UseUpdateCoachCapacitySettingsMutationReturn {
  const adapter = useAdminReportsAdapter();
  const queryClient = useQueryClient();

  const updateCoachCapacitySettingsMutation = useMutation({
    mutationFn: (command: UpdateCoachCapacitySettingsCommand) =>
      adapter.updateCoachCapacitySettings(command),
    // Returned so the save resolves only once the report shows the new values
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: COACH_CAPACITY_TODAY_REPORT_QUERY_KEY,
      }),
  });

  return { updateCoachCapacitySettingsMutation };
}
