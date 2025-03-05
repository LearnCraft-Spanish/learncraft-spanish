import type { QueryFunctionContext } from '@tanstack/react-query';
import type * as StudentRecordsTypes from 'src/types/CoachingTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'react-toastify';

import getDateRange from 'src/components/Coaching/general/functions/dateRange';
import { useBackendHelpers } from '../useBackend';
import { useUserData } from '../UserData/useUserData';

export default function useWeeks() {
  const { newPutFactory, getFactory } = useBackendHelpers();
  const userDataQuery = useUserData();
  const queryClient = useQueryClient();
  const dateRange = useMemo(() => getDateRange(), []);

  // const getWeeks = useCallback(
  //   (
  //     startDate: string,
  //     endDate: string,
  //   ): Promise<StudentRecordsTypes.Week[]> => {
  //     return getFactory(
  //       `coaching/weeks?startDate=${startDate}&endDate=${endDate}`,
  //     );
  //   },
  //   [getFactory],
  // );
  function getWeeks({
    queryKey,
  }: QueryFunctionContext<
    [string, { startDate: string; endDate: string }]
  >): Promise<StudentRecordsTypes.Week[]> {
    const [, { startDate, endDate }] = queryKey;
    return getFactory(`coaching/weeks/${startDate}.${endDate}`);
  }

  const weeksQuery = useQuery({
    queryKey: [
      'weeksQuery',
      { startDate: dateRange.lastSundayDate, endDate: dateRange.nextWeekDate },
    ],
    queryFn: getWeeks,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  const refetchWeeks = (newStartDate: string, newEndDate: string) => {
    queryClient.invalidateQueries({
      queryKey: [
        'weeksQuery',
        { startDate: newStartDate, endDate: newEndDate },
      ],
    });
  };

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
      weeksQuery.refetch();
    },
  });

  return {
    weeksQuery,
    refetchWeeks,
    updateWeekMutation,
  };
}
