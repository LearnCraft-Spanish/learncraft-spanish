import type { UpdateCoachCapacitySettingsCommand } from '@application/ports/AdminReports/adminReportsPort';
import type { CoachCapacitySettings } from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { COACH_CAPACITY_REPORT_QUERY_KEY } from '@application/queries/AdminReportQueries/useCoachCapacityReportQuery';
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
    // A coach's settings feed every Coach Capacity report. The open ones
    // refetch; returned so the save resolves only once they show the new
    // values. A cached report that is not open is dropped, so switching to it
    // loads the new values rather than showing the old ones while it refetches.
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: COACH_CAPACITY_REPORT_QUERY_KEY,
        type: 'inactive',
      });
      return queryClient.invalidateQueries({
        queryKey: COACH_CAPACITY_REPORT_QUERY_KEY,
      });
    },
  });

  return { updateCoachCapacitySettingsMutation };
}
