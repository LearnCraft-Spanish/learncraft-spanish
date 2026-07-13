import type { AssignmentsPort } from '@application/ports/assignmentsPort';
import {
  assignmentsFactory,
  baseAssignmentFactory,
} from '@testing/factories/assignmentsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAssignmentsAdapter: AssignmentsPort = {
  getAssignmentLookups: async () => assignmentsFactory(),
  createAssignment: async (_assignment) => baseAssignmentFactory(),
  updateAssignment: async (_assignment) => baseAssignmentFactory(),
  deleteAssignment: async (_data) => {},
};

export const {
  mock: mockAssignmentsAdapter,
  override: overrideMockAssignmentsAdapter,
  reset: resetMockAssignmentsAdapter,
} = createOverrideableMock<AssignmentsPort>(defaultMockAssignmentsAdapter);

export default mockAssignmentsAdapter;
