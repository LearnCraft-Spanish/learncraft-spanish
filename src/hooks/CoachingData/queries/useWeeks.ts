import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useMutation, useQuery } from '@tanstack/react-query';

import { toast } from 'react-toastify';
import { useBackendHelpers } from '../../useBackend';
import useStudentRecordsBackend from './StudentRecordsBackendFunctions';

export default function useWeeks(
  startDate: string | undefined,
  endDate: string | undefined,
) {
  const { newPutFactory } = useBackendHelpers();
  const { isAdmin, isCoach } = useAuthAdapter();
  const { getWeeks } = useStudentRecordsBackend();

  const weeksQuery = useQuery({
    queryKey: ['weeksQuery', { startDate, endDate }],
    queryFn: getWeeks,
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  interface WeekForUpdate {
    notes: string;
    holdWeek: boolean;
    recordsComplete: boolean;
    offTrack: boolean;
    primaryCoachWhenCreated: string;
    recordId: number;
    currentLesson: number | undefined | null;
  }
  const updateWeekMutation = useMutation({
    mutationFn: (week: WeekForUpdate) => {
      const promise = newPutFactory({ path: `coaching/weeks`, body: week });
      toast.promise(promise, {
        pending: 'Updating week...',
        success: 'Week updated!',
        error: 'Error updating week',
      });
      return promise;
    },

    onSuccess: () => {
      weeksQuery.refetch();
    },
  });

  return {
    weeksQuery,
    updateWeekMutation,
  };
}
