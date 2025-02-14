import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react'; // Adjust the import based on your project structure
import { useBackend } from 'src/hooks/useBackend';
import { useUserData } from './useUserData';
// import useAuth from 'src/hooks/useAuth';

export function usePMFData() {
  const { getPMFDataForUser, createPMFDataForUser, updatePMFDataForUser } =
    useBackend();
  const userDataQuery = useUserData();

  const getPMFData = useCallback(async () => {
    if (userDataQuery.isSuccess) {
      return await getPMFDataForUser(userDataQuery.data.recordId);
    }
  }, [userDataQuery.isSuccess, userDataQuery.data, getPMFDataForUser]);

  const pmfDataQuery = useQuery({
    queryKey: ['pmfData', userDataQuery.data?.recordId],
    queryFn: getPMFData,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: userDataQuery.data?.roles.studentRole === 'student',
  });

  interface CreateOrUpdatePMFData {
    hasTakenSurvey: boolean;
  }
  const createOrUpdatePMFData = useCallback(
    async ({ hasTakenSurvey }: CreateOrUpdatePMFData) => {
      if (userDataQuery.isSuccess && pmfDataQuery.isSuccess) {
        if (!pmfDataQuery.data) {
          const result = await createPMFDataForUser(
            userDataQuery.data.recordId,
            hasTakenSurvey,
          );
          if (result === 1) {
            pmfDataQuery.refetch();
          }
        } else {
          const result = await updatePMFDataForUser({
            studentId: userDataQuery.data.recordId,
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
      userDataQuery.isSuccess,
      userDataQuery.data,
      pmfDataQuery,
      createPMFDataForUser,
      updatePMFDataForUser,
    ],
  );

  const canShowPMF = useMemo(() => {
    if (
      !userDataQuery.data ||
      userDataQuery.data.roles.studentRole !== 'student'
    ) {
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
  }, [pmfDataQuery.data, userDataQuery.data]);

  return { pmfDataQuery, createOrUpdatePMFData, canShowPMF };
}
