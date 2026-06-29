import type { UseAllCoachingStudentsQueryReturn } from '@application/queries/CoachingStudentQueries/useAllCoachingStudentsQuery';
import type { CoachingStudent } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockCoachingStudentList } from '@testing/factories/coachingStudentFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockImplementation: UseAllCoachingStudentsQueryReturn = {
  allCoachingStudentsQuery: {
    data: createMockCoachingStudentList(3),
    isLoading: false,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: 'success',
    error: null,
  } as UseQueryResult<CoachingStudent[]>,
};

export const {
  mock: mockUseAllCoachingStudentsQuery,
  override: overrideMockUseAllCoachingStudentsQuery,
  reset: resetMockUseAllCoachingStudentsQuery,
} = createOverrideableMock<UseAllCoachingStudentsQueryReturn>(
  defaultMockImplementation,
);

export default mockUseAllCoachingStudentsQuery;
