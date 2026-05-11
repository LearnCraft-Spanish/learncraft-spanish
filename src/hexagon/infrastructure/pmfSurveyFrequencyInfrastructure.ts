import type { AuthPort } from '@application/ports/authPort';
import type { PMFSurveyFrequency } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  createPMFSurveyFrequencyEndpoint,
  getPMFSurveyFrequencyEndpoint,
  updatePMFSurveyFrequencyEndpoint,
} from '@learncraft-spanish/shared';

export function createPMFSurveyFrequencyInfrastructure(
  apiUrl: string,
  auth: AuthPort,
) {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getPMFSurveyFrequency: async (
      studentId: number,
    ): Promise<PMFSurveyFrequency | null> => {
      const path = getPMFSurveyFrequencyEndpoint.path.replace(
        ':studentId',
        String(studentId),
      );
      return await httpClient.get<PMFSurveyFrequency | null>(
        path,
        getPMFSurveyFrequencyEndpoint.requiredScopes,
      );
    },

    createPMFSurveyFrequency: async (
      studentId: number,
      hasTakenSurvey: boolean,
    ): Promise<PMFSurveyFrequency> => {
      return await httpClient.post<PMFSurveyFrequency>(
        createPMFSurveyFrequencyEndpoint.path,
        createPMFSurveyFrequencyEndpoint.requiredScopes,
        { studentId, hasTakenSurvey },
      );
    },

    updatePMFSurveyFrequency: async ({
      recordId,
      studentId,
      hasTakenSurvey,
    }: {
      recordId: number;
      studentId: number;
      hasTakenSurvey: boolean;
    }): Promise<PMFSurveyFrequency> => {
      return await httpClient.post<PMFSurveyFrequency>(
        updatePMFSurveyFrequencyEndpoint.path,
        updatePMFSurveyFrequencyEndpoint.requiredScopes,
        { recordId, studentId, hasTakenSurvey },
      );
    },
  };
}
