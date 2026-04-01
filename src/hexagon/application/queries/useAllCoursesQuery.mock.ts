import type { UseAllCoursesQueryReturn } from '@application/queries/useAllCoursesQuery';
import { createRealisticCourseDetailedList } from '@testing/factories/courseFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockImplementation: UseAllCoursesQueryReturn = {
  data: createRealisticCourseDetailedList(),
  isLoading: false,
  isError: false,
  isSuccess: true,
  refetch: () => {},
};

export const {
  mock: mockUseAllCoursesQuery,
  override: overrideMockUseAllCoursesQuery,
  reset: resetMockUseAllCoursesQuery,
} = createOverrideableMock<UseAllCoursesQueryReturn>(defaultMockImplementation);

export default mockUseAllCoursesQuery;
