import type { PMFSurveyFrequency } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { usePMFSurveyFrequencyAdapter } from '@application/adapters/pmfSurveyFrequencyAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export interface CreateOrUpdatePMFData {
  hasTakenSurvey: boolean;
}

export interface UsePMFSurveyFrequencyQueryReturn {
  pmfDataQuery: UseQueryResult<PMFSurveyFrequency | null | undefined>;
  createOrUpdatePMFData: (params: CreateOrUpdatePMFData) => Promise<void>;
}

export function usePMFSurveyFrequencyQuery(): UsePMFSurveyFrequencyQueryReturn {
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

  return { pmfDataQuery, createOrUpdatePMFData };
}
