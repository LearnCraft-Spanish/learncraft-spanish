import type { CoursePort } from '../ports/coursePort';
import { createRealisticCourseWithLessonsList } from '@testing/factories/courseFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAdapter: CoursePort = {
  getCoursesWithLessons: () => {
    return Promise.resolve(createRealisticCourseWithLessonsList());
  },
  getLessonsByVocabulary: () => Promise.resolve([]),
  getLessonVocabKnown: () => Promise.reject(new Error('Not implemented')),
  getLessonRangeVocabRequired: () =>
    Promise.reject(new Error('Not implemented')),
};

export const {
  mock: mockCourseAdapter,
  override: overrideMockCourseAdapter,
  reset: resetMockCourseAdapter,
} = createOverrideableMock<CoursePort>(defaultMockAdapter);

export default mockCourseAdapter;
