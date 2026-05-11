import type { PMFSurveyFrequencyPort } from '@application/ports/pmfSurveyFrequencyPort';
import type { PMFSurveyFrequency } from '@learncraft-spanish/shared';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

function createMockPMFRecord(params: {
  id: number;
  studentId: number;
  lastContactDate: string;
  hasTakenSurvey: boolean;
}): PMFSurveyFrequency {
  return {
    id: params.id,
    relatedStudent: params.studentId,
    lastContactDate: params.lastContactDate,
    hasTakenSurvey: params.hasTakenSurvey,
  };
}

export const defaultMockPMFSurveyFrequencyAdapter: PMFSurveyFrequencyPort = {
  getPMFSurveyFrequency: async () => null,
  createPMFSurveyFrequency: async (
    studentId: number,
    hasTakenSurvey: boolean,
  ) =>
    createMockPMFRecord({
      id: 1,
      studentId,
      lastContactDate: new Date().toISOString(),
      hasTakenSurvey,
    }),
  updatePMFSurveyFrequency: async ({ recordId, studentId, hasTakenSurvey }) =>
    createMockPMFRecord({
      id: recordId,
      studentId,
      lastContactDate: new Date().toISOString(),
      hasTakenSurvey,
    }),
};

export const {
  mock: mockPMFSurveyFrequencyAdapter,
  override: overrideMockPMFSurveyFrequencyAdapter,
  reset: resetMockPMFSurveyFrequencyAdapter,
} = createOverrideableMock<PMFSurveyFrequencyPort>(
  defaultMockPMFSurveyFrequencyAdapter,
);

export default mockPMFSurveyFrequencyAdapter;
