import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useBackend } from 'src/hooks/useBackend';
// import useAuth from 'src/hooks/useAuth';

export function usePMFData() {
  const { getPMFDataForUser, createPMFDataForUser, updatePMFDataForUser } =
    useBackend();
  const { isStudent } = useAuthAdapter();
  const { appUser, isOwnUser } = useActiveStudent();

  const getPMFData = useCallback(async () => {
    if (appUser && isOwnUser) {
      return await getPMFDataForUser(appUser.recordId);
    }
  }, [appUser, isOwnUser, getPMFDataForUser]);

  const pmfDataQuery = useQuery({
    queryKey: ['pmfData', appUser?.recordId],
    queryFn: getPMFData,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: isOwnUser && isStudent,
  });

  interface CreateOrUpdatePMFData {
    hasTakenSurvey: boolean;
  }
  const createOrUpdatePMFData = useCallback(
    async ({ hasTakenSurvey }: CreateOrUpdatePMFData) => {
      if (isOwnUser && pmfDataQuery.isSuccess && appUser) {
        if (!pmfDataQuery.data) {
          const result = await createPMFDataForUser(
            appUser.recordId,
            hasTakenSurvey,
          );
          if (result === 1) {
            pmfDataQuery.refetch();
          }
        } else {
          const result = await updatePMFDataForUser({
            studentId: appUser.recordId,
            recordId: pmfDataQuery.data.recordId,
            hasTakenSurvey,
          });
          if (result === 1) {
            pmfDataQuery.refetch();
          }
        }
      }
    },
    [
      isOwnUser,
      appUser,
      pmfDataQuery,
      createPMFDataForUser,
      updatePMFDataForUser,
    ],
  );

  const canShowPMF = useMemo(() => {
    if (!isOwnUser || !isStudent) {
      return false;
    }
    // Check if the last contact date is within 60 days
    if (pmfDataQuery.data) {
      const intervalInDays = 60; // number of days for comparison

      const date = new Date().toISOString();
      const storedDate = pmfDataQuery.data.lastContactDate; // Stored date will be in ISOString format
      const storedDateInDays = Math.floor(Date.parse(storedDate) / 86400000);
      const currentDateInDays = Math.floor(Date.parse(date) / 86400000);

      const diff = currentDateInDays - storedDateInDays;
      if (diff <= intervalInDays) {
        // Too soon to show the PMF
        return false;
      }
    }
    // calcualte if we should show the PMF via random number
    const randomNumber = Math.floor(Math.random() * 30);
    // const randomNumber = 1; // for testing
    if (randomNumber === 1) {
      return true;
    }
    return false;
  }, [pmfDataQuery.data, isOwnUser, isStudent]);

  return { pmfDataQuery, createOrUpdatePMFData, canShowPMF };
}
