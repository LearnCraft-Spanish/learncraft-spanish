import type { UsePMFSurveyFrequencyQueryReturn } from '@application/queries/usePMFSurveyFrequencyQuery';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { usePMFSurveyFrequencyQuery } from '@application/queries/usePMFSurveyFrequencyQuery';
import { canShowPMFSurvey } from '@domain/functions/canShowPMFSurvey';
import { useMemo } from 'react';

export interface UsePMFDataReturn {
  pmfDataQuery: UsePMFSurveyFrequencyQueryReturn['pmfDataQuery'];
  createOrUpdatePMFData: UsePMFSurveyFrequencyQueryReturn['createOrUpdatePMFData'];
  canShowPMF: boolean;
}

export function usePMFData(): UsePMFDataReturn {
  const { isStudent } = useAuthAdapter();
  const { isOwnUser } = useActiveStudent();
  const { pmfDataQuery, createOrUpdatePMFData } = usePMFSurveyFrequencyQuery();

  const canShowPMF = useMemo(() => {
    if (!isOwnUser || !isStudent) {
      return false;
    }
    return canShowPMFSurvey({
      lastContactDate: pmfDataQuery.data?.lastContactDate,
      now: new Date(),
      randomRoll: Math.floor(Math.random() * 30),
    });
  }, [pmfDataQuery.data, isOwnUser, isStudent]);

  return { pmfDataQuery, createOrUpdatePMFData, canShowPMF };
}
