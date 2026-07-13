import { assignmentsFactory } from '@testing/factories/assignmentsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

interface UseAssignmentLookupsQueryReturn {
  assignmentTypes:
    ReturnType<typeof assignmentsFactory>['assignmentTypes'] | undefined;
  assignmentRatings:
    ReturnType<typeof assignmentsFactory>['assignmentRatings'] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const mockData = assignmentsFactory();

const defaultMockImplementation: UseAssignmentLookupsQueryReturn = {
  assignmentTypes: mockData.assignmentTypes,
  assignmentRatings: mockData.assignmentRatings,
  isLoading: false,
  error: null,
};

export const {
  mock: mockUseAssignmentLookupsQuery,
  override: overrideMockUseAssignmentLookupsQuery,
  reset: resetMockUseAssignmentLookupsQuery,
} = createOverrideableMock<UseAssignmentLookupsQueryReturn>(
  defaultMockImplementation,
);

export default mockUseAssignmentLookupsQuery;
