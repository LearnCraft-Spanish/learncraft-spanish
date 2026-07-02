import type { AssignmentsPort } from '@application/ports/assignmentsPort';
import { assignmentsFactory } from '@testing/factories/assignmentsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAssignmentsAdapter: AssignmentsPort = {
  getAssignmentLookups: async () => assignmentsFactory(),
};

export const {
  mock: mockAssignmentsAdapter,
  override: overrideMockAssignmentsAdapter,
  reset: resetMockAssignmentsAdapter,
} = createOverrideableMock<AssignmentsPort>(defaultMockAssignmentsAdapter);

export default mockAssignmentsAdapter;
