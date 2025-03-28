import type { Coach } from 'src/types/CoachingTypes';
import { useEffect, useState } from 'react';
import { useCoachList } from 'src/hooks/CoachingData/queries';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useUserData } from 'src/hooks/UserData/useUserData';

export const useCoachingDashboard = () => {
  const userDataQuery = useUserData();
  const { coachListQuery } = useCoachList();
  const { weeksQuery } = useCoaching();

  const isLoading =
    userDataQuery.isLoading || coachListQuery.isLoading || weeksQuery.isLoading;
  const isError =
    userDataQuery.isError || coachListQuery.isError || weeksQuery.isError;
  const dataReady =
    userDataQuery.isSuccess && coachListQuery.isSuccess && weeksQuery.isSuccess;

  const [coach, setCoach] = useState<Coach | null>(null);

  useEffect(() => {
    if (dataReady) {
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
  }, [coachListQuery, userDataQuery, dataReady]);

  return { isLoading, isError, dataReady, coach };
};

/*
useEffect(() => {
    if (
      !rendered.current &&
      weeksQuery.isSuccess &&
      coachListQuery.isSuccess &&
      userDataQuery.isSuccess
    ) {
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
        if (currentUserCoach) setFilterByCoach(currentUserCoach);
      }
      rendered.current = true;
    }
  }, [weeksQuery, coachListQuery, userDataQuery]);

*/
