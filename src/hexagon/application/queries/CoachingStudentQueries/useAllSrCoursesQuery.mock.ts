import type { UseAllSrCoursesQueryReturn } from '@application/queries/CoachingStudentQueries/useAllSrCoursesQuery';
import type { SrCourse } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockSrCourseList } from '@testing/factories/coachingStudentFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockImplementation: UseAllSrCoursesQueryReturn = {
  allSrCoursesQuery: {
    data: createMockSrCourseList(3),
    isLoading: false,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: 'success',
    error: null,
  } as UseQueryResult<SrCourse[]>,
};

export const {
  mock: mockUseAllSrCoursesQuery,
  override: overrideMockUseAllSrCoursesQuery,
  reset: resetMockUseAllSrCoursesQuery,
} = createOverrideableMock<UseAllSrCoursesQueryReturn>(
  defaultMockImplementation,
);

export default mockUseAllSrCoursesQuery;
