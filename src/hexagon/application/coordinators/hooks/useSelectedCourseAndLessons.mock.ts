import type { UseSelectedCourseAndLessonsReturnType } from '@application/coordinators/hooks/types';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockAdapter: UseSelectedCourseAndLessonsReturnType = {
  course: null,
  courseId: null,
  fromLessonNumber: null,
  toLessonNumber: null,
  fromLesson: null,
  toLesson: null,
  updateUserSelectedCourseId: vi.fn<() => void>(),
  updateFromLessonNumber: vi.fn<() => void>(),
  updateToLessonNumber: vi.fn<() => void>(),
  isLoading: false,
  error: null,
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockSelectedCourseAndLessons,
  override: overrideMockSelectedCourseAndLessons,
  reset: resetMockSelectedCourseAndLessons,
} = createOverrideableMock<UseSelectedCourseAndLessonsReturnType>(
  defaultMockAdapter,
);

export default mockSelectedCourseAndLessons;
