import type { PMFSurveyFrequencyPort } from '@application/ports/pmfSurveyFrequencyPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createPMFSurveyFrequencyInfrastructure } from '@infrastructure/pmfSurveyFrequencyInfrastructure';

export function usePMFSurveyFrequencyAdapter(): PMFSurveyFrequencyPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createPMFSurveyFrequencyInfrastructure(apiUrl, auth);
}
