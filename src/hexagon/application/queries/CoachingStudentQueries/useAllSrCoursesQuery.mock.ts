import type { UseAllSrCoursesQueryReturn } from '@application/queries/CoachingStudentQueries/useAllSrCoursesQuery';
import { createMockSrCourseList } from '@testing/factories/coachingStudentFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockImplementation: UseAllSrCoursesQueryReturn = {
  srCourses: createMockSrCourseList(3),
  isLoading: false,
  error: null,
};

export const {
  mock: mockUseAllSrCoursesQuery,
  override: overrideMockUseAllSrCoursesQuery,
  reset: resetMockUseAllSrCoursesQuery,
} = createOverrideableMock<UseAllSrCoursesQueryReturn>(
  defaultMockImplementation,
);

export default mockUseAllSrCoursesQuery;
