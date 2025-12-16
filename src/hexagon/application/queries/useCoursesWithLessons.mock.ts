import type { UseCoursesWithLessonsReturn } from '@application/queries/useCoursesWithLessons';
import { createRealisticCourseWithLessonsList } from '@testing/factories/courseFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Create a default mock implementation
const defaultMockImplementation: UseCoursesWithLessonsReturn = {
  data: createRealisticCourseWithLessonsList(),
  isLoading: false,
  error: null,
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseCoursesWithLessons,
  override: overrideMockUseCoursesWithLessons,
  reset: resetMockUseCoursesWithLessons,
} = createOverrideableMock<UseCoursesWithLessonsReturn>(
  defaultMockImplementation,
);

// Export the default mock for global mocking
export default mockUseCoursesWithLessons;
