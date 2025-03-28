import type { Coach } from 'src/types/CoachingTypes';
import { useEffect, useState } from 'react';
import { useCoachList } from 'src/hooks/CoachingData/queries';
import { useUserData } from 'src/hooks/UserData/useUserData';

export default function useActiveCoach() {
  const userDataQuery = useUserData();
  const { coachListQuery } = useCoachList();

  const isLoading = userDataQuery.isLoading || coachListQuery.isLoading;
  const isError = userDataQuery.isError || coachListQuery.isError;
  const isSuccess = userDataQuery.isSuccess && coachListQuery.isSuccess;

  const [coach, setCoach] = useState<Coach | null>(null);

  useEffect(() => {
    if (isSuccess) {
      const possibleEmailDomains = [
        '@learncraftspanish.com',
        '@masterofmemory.com',
      ];
      if (userDataQuery.data.emailAddress) {
        const currentUserCoach = coachListQuery.data.find((coach) => {
          const emailPrefix = userDataQuery.data.emailAddress
            .split('@')[0]
            .toLowerCase();
          for (const domain of possibleEmailDomains) {
            if (coach.user.email.toLowerCase() === emailPrefix + domain) {
              return true;
            }
          }
          return false;
        });
        if (currentUserCoach) setCoach(currentUserCoach);
      }
    }
  }, [coachListQuery, userDataQuery, isSuccess]);

  return { states: { isLoading, isError, isSuccess }, coach };
}
