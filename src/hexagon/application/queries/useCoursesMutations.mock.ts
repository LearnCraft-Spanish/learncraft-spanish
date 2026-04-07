import type { UseCoursesUpdateReturn } from '@application/queries/useCoursesMutations';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockImplementation: UseCoursesUpdateReturn = {
  updateCourses: (courses) => Promise.resolve(courses),
  isPending: false,
  error: null,
};

export const {
  mock: mockUseCoursesMutations,
  override: overrideMockUseCoursesMutations,
  reset: resetMockUseCoursesMutations,
} = createOverrideableMock<UseCoursesUpdateReturn>(defaultMockImplementation);

export default mockUseCoursesMutations;
