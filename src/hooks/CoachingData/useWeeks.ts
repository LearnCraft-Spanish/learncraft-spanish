import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useUserData } from '../UserData/useUserData';
import { useBackend, useBackendHelpers } from '../useBackend';

export default function useWeeks() {
  const backend = useBackend();
  const { newPutFactory } = useBackendHelpers();
  const userDataQuery = useUserData();

  const lastThreeWeeksQuery = useQuery({
    queryKey: ['lastThreeWeeks'],
    queryFn: backend.getNewWeeks,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  interface WeekForUpdate {
    notes: string;
    holdWeek: boolean;
    recordsComplete: boolean;
    offTrack: boolean;
    primaryCoachWhenCreated: string;
    recordId: number;
    currentLesson: number | undefined;
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
      lastThreeWeeksQuery.refetch();
    },
  });

  return {
    lastThreeWeeksQuery,
    updateWeekMutation,
  };
}
