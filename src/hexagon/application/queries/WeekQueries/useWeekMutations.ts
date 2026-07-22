import type {
  BaseWeek,
  FurnishedWeekWithCoach,
  UpdateWeekCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { useWeeklyRecordsAdapter } from '@application/adapters/weeklyRecordsAdapter';
import { MEMBERSHIP_WEEKS_QUERY_KEY_ROOT } from '@application/queries/WeekQueries/useMembershipWeeksQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const WEEKS_QUERY_KEY = ['weeklyRecords', 'weeksByStartDate'];

export interface UseWeekMutationsReturn {
  updateWeekMutation: UseMutationResult<BaseWeek[], Error, UpdateWeekCommand[]>;
}

export function useWeekMutations(): UseWeekMutationsReturn {
  const { updateWeeks } = useWeeklyRecordsAdapter();
  const queryClient = useQueryClient();

  const updateWeekMutation = useMutation({
    mutationFn: (weeks: UpdateWeekCommand[]) => updateWeeks(weeks),
    onSuccess: (updatedWeeks) => {
      queryClient.setQueriesData<FurnishedWeekWithCoach[]>(
        { queryKey: WEEKS_QUERY_KEY },
        (weeks) => {
          if (!weeks) return weeks;
          return weeks.map((week) => {
            const updatedWeek = updatedWeeks.find(
              (updated) => updated.weekId === week.weekId,
            );
            if (!updatedWeek) return week;
            return {
              ...week,
              notes: updatedWeek.notes,
              holdWeek: updatedWeek.holdWeek,
              recordComplete: updatedWeek.recordComplete,
              lesson: updatedWeek.lesson,
            };
          });
        },
      );
      void queryClient.invalidateQueries({
        queryKey: MEMBERSHIP_WEEKS_QUERY_KEY_ROOT,
      });
    },
  });

  return { updateWeekMutation };
}
