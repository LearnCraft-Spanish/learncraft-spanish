import type { Coach } from '@learncraft-spanish/shared';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useAllCoachesQuery } from '@application/queries/CoachQueries/useAllCoachesQuery';
import { useMemo } from 'react';
// import useActiveCoach from './hooks/useActiveCoach';
// import useMyIncompleteWeeklyRecords from './hooks/useMyIncompleteWeeklyRecords';

export interface UseCoachingDashboardReturn {
  currentCoach: Coach | undefined;
  states: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
  };
}

export default function useCoachingDashboard(): UseCoachingDashboardReturn {
  // Legacy coach list / incomplete weekly records — not yet reimplemented
  // const { coach } = useActiveCoach();
  // const { states } = useMyIncompleteWeeklyRecords({ coach });

  const {
    coaches,
    isLoading: coachesLoading,
    error: coachesError,
  } = useAllCoachesQuery();
  const {
    authUser,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuthAdapter();

  const currentCoach = useMemo(() => {
    const possibleEmailDomains = [
      '@learncraftspanish.com',
      '@masterofmemory.com',
    ];

    if (authUser?.email) {
      const currentUserCoach = coaches?.find((coachItem) => {
        const emailPrefix = authUser.email.split('@')[0].toLowerCase();
        for (const domain of possibleEmailDomains) {
          if (coachItem.email.toLowerCase() === emailPrefix + domain) {
            return true;
          }
        }
        return false;
      });
      if (currentUserCoach) return currentUserCoach;
    }
  }, [authUser, coaches]);

  const isLoading = coachesLoading || authLoading;
  const isError =
    !!coachesError ||
    (!coachesLoading && isAuthenticated && currentCoach === undefined);
  const isSuccess =
    !coachesLoading && isAuthenticated && currentCoach !== undefined;

  return {
    currentCoach,
    states: { isLoading, isError, isSuccess },
  };
}
