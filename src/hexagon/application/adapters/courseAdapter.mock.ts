import type { CoursePort } from '@application/ports/coursePort';
import {
  createRealisticCourseDetailedList,
  createRealisticCourseWithLessonsList,
} from '@testing/factories/courseFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAdapter: CoursePort = {
  getPublishedCoursesWithLessons: () => {
    return Promise.resolve(createRealisticCourseWithLessonsList());
  },
  getAllCoursesWithLessons: () => {
    return Promise.resolve(createRealisticCourseWithLessonsList());
  },
  getLessonsByVocabulary: () => Promise.resolve([]),
  getLessonVocabKnown: () => Promise.reject(new Error('Not implemented')),
  getLessonRangeVocabRequired: () =>
    Promise.reject(new Error('Not implemented')),
  getAllCourses: () => Promise.resolve(createRealisticCourseDetailedList()),
  updateCourses: (courses) => Promise.resolve(courses),
};

export const {
  mock: mockCourseAdapter,
  override: overrideMockCourseAdapter,
  reset: resetMockCourseAdapter,
} = createOverrideableMock<CoursePort>(defaultMockAdapter);

export default mockCourseAdapter;
