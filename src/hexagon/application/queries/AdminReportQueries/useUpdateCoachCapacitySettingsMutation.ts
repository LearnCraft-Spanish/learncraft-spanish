import type {
  CoachCapacityReportRow,
  CoachCapacitySettings,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { COACH_CAPACITY_REPORT_QUERY_KEY } from '@application/queries/AdminReportQueries/useCoachCapacityReportQuery';
import { applyCoachCapacitySettings } from '@domain/functions/coachCapacity';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** Changes to one coach's settings; whatever is left out keeps its saved value */
export interface UpdateCoachCapacitySettingsVariables {
  coachId: number;
  changes: Partial<CoachCapacitySettings>;
}

export interface UseUpdateCoachCapacitySettingsMutationReturn {
  updateCoachCapacitySettingsMutation: UseMutationResult<
    CoachCapacitySettings,
    Error,
    UpdateCoachCapacitySettingsVariables
  >;
}

/**
 * Saves run one at a time, in the order they were made, so a save never
 * overwrites a newer one. Each is sent as the coach's whole settings: its
 * changes on top of the saved settings as the previous save left them.
 */
const SAVE_SCOPE = { id: 'coachCapacitySettings' };

export function useUpdateCoachCapacitySettingsMutation(): UseUpdateCoachCapacitySettingsMutationReturn {
  const adapter = useAdminReportsAdapter();
  const queryClient = useQueryClient();

  const updateCoachCapacitySettingsMutation = useMutation({
    scope: SAVE_SCOPE,
    mutationFn: ({
      coachId,
      changes,
    }: UpdateCoachCapacitySettingsVariables) => {
      const saved = queryClient
        .getQueriesData<CoachCapacityReportRow[]>({
          queryKey: COACH_CAPACITY_REPORT_QUERY_KEY,
        })
        .flatMap(([, rows]) => rows ?? [])
        .find((row) => row.coach.coach_id === coachId)?.settings;
      if (!saved) {
        return Promise.reject(
          new Error(
            `Coach ${coachId} is not in a loaded Coach Capacity report`,
          ),
        );
      }
      return adapter.updateCoachCapacitySettings({
        coachId,
        settings: { ...saved, ...changes },
      });
    },
    // A coach's settings show up in every Coach Capacity report, so each
    // cached one takes the saved settings in place of a refetch.
    onSuccess: (settings, { coachId }) => {
      queryClient.setQueriesData<CoachCapacityReportRow[]>(
        { queryKey: COACH_CAPACITY_REPORT_QUERY_KEY },
        (rows) =>
          rows?.map((row) =>
            row.coach.coach_id === coachId
              ? applyCoachCapacitySettings(row, settings)
              : row,
          ),
      );
      // A report still loading may have been read before this save landed,
      // so it starts over rather than overwrite the saved settings.
      void queryClient.invalidateQueries({
        queryKey: COACH_CAPACITY_REPORT_QUERY_KEY,
        predicate: (query) => query.state.fetchStatus === 'fetching',
      });
    },
  });

  return { updateCoachCapacitySettingsMutation };
}
