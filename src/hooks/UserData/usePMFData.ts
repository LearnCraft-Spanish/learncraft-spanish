import { useAuthAdapter } from '@application/adapters/authAdapter';
import { usePMFSurveyFrequencyAdapter } from '@application/adapters/pmfSurveyFrequencyAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export function usePMFData() {
  const {
    getPMFSurveyFrequency,
    createPMFSurveyFrequency,
    updatePMFSurveyFrequency,
  } = usePMFSurveyFrequencyAdapter();
  const { isStudent } = useAuthAdapter();
  const { appUser, isOwnUser } = useActiveStudent();

  const getPMFData = useCallback(async () => {
    if (appUser && isOwnUser) {
      return await getPMFSurveyFrequency(appUser.recordId);
    }
  }, [appUser, isOwnUser, getPMFSurveyFrequency]);

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
          await createPMFSurveyFrequency(appUser.recordId, hasTakenSurvey);
          pmfDataQuery.refetch();
        } else {
          await updatePMFSurveyFrequency({
            studentId: appUser.recordId,
            recordId: pmfDataQuery.data.id,
            hasTakenSurvey,
          });
          pmfDataQuery.refetch();
        }
      }
    },
    [
      isOwnUser,
      appUser,
      pmfDataQuery,
      createPMFSurveyFrequency,
      updatePMFSurveyFrequency,
    ],
  );

  const canShowPMF = useMemo(() => {
    if (!isOwnUser || !isStudent) {
      return false;
    }
    // Check if the last contact date is within 60 days
    if (pmfDataQuery.data?.lastContactDate) {
      const intervalInDays = 60;

      const date = new Date().toISOString();
      const storedDate = pmfDataQuery.data.lastContactDate;
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
