import type { CoursePort } from '../ports/coursePort';
import {
  createMockLessonWithVocab,
  createRealisticCourseWithLessonsList,
} from '@testing/factories/courseFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAdapter: CoursePort = {
  getCoursesWithLessons: () => {
    return Promise.resolve(createRealisticCourseWithLessonsList());
  },
  getLessonsByVocabulary: () => Promise.resolve([]),
  getLessonWithVocabulary: () => Promise.resolve(createMockLessonWithVocab()),
};

export const {
  mock: mockCourseAdapter,
  override: overrideMockCourseAdapter,
  reset: resetMockCourseAdapter,
} = createOverrideableMock<CoursePort>(defaultMockAdapter);

export default mockCourseAdapter;
