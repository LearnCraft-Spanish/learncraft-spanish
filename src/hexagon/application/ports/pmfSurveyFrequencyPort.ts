import type { PMFSurveyFrequency } from '@learncraft-spanish/shared';

export interface PMFSurveyFrequencyPort {
  getPMFSurveyFrequency: (
    studentId: number,
  ) => Promise<PMFSurveyFrequency | null>;
  createPMFSurveyFrequency: (
    studentId: number,
    hasTakenSurvey: boolean,
  ) => Promise<PMFSurveyFrequency>;
  updatePMFSurveyFrequency: ({
    recordId,
    studentId,
    hasTakenSurvey,
  }: {
    recordId: number;
    studentId: number;
    hasTakenSurvey: boolean;
  }) => Promise<PMFSurveyFrequency>;
}
