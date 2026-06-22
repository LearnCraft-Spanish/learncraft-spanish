import type { CoachingStudentsPort } from '@application/ports/coachingStudentsPort';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockCoachingStudentsAdapter: CoachingStudentsPort = {
  getAllCoachingStudents: async () => [],
};

export const {
  mock: mockCoachingStudentsAdapter,
  override: overrideMockCoachingStudentsAdapter,
  reset: resetMockCoachingStudentsAdapter,
} = createOverrideableMock<CoachingStudentsPort>(
  defaultMockCoachingStudentsAdapter,
);

export default mockCoachingStudentsAdapter;
