import type { UseSelectedCourseAndLessonsReturnType } from './types';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockAdapter: UseSelectedCourseAndLessonsReturnType = {
  course: null,
  fromLesson: null,
  toLesson: null,
  updateUserSelectedCourseId: vi.fn<() => void>(),
  updateFromLessonNumber: vi.fn<() => void>(),
  updateToLessonNumber: vi.fn<() => void>(),
  isLoading: false,
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
