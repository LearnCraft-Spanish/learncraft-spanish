import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useMemo } from 'react';
import { useCoachList } from 'src/hooks/CoachingData/queries';

export default function useActiveCoach() {
  const {
    authUser,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuthAdapter();
  const { coachListQuery } = useCoachList();

  const isLoading = authLoading || coachListQuery.isLoading;
  const isError = coachListQuery.isError;
  const isSuccess = isAuthenticated && coachListQuery.isSuccess;

  const coach = useMemo(() => {
    if (!isSuccess) return null;
    const possibleEmailDomains = [
      '@learncraftspanish.com',
      '@masterofmemory.com',
    ];
    if (authUser?.email) {
      const currentUserCoach = coachListQuery.data.find((coach) => {
        if (coach.user.email === 'ana-brown@learncraftspanish.com') {
          return true;
        }
        const emailPrefix = authUser.email.split('@')[0].toLowerCase();
        for (const domain of possibleEmailDomains) {
          if (coach.user.email.toLowerCase() === emailPrefix + domain) {
            return true;
          }
        }
        return false;
      });
      if (currentUserCoach) return currentUserCoach;
    }
    return undefined;
  }, [isSuccess, authUser?.email, coachListQuery.data]);

  return { coach, states: { isLoading, isError, isSuccess } };
}
