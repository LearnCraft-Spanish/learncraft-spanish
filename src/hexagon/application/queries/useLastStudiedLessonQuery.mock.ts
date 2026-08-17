import type { UseLastStudiedLessonQueryReturn } from '@application/queries/useLastStudiedLessonQuery';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockResult: UseLastStudiedLessonQueryReturn = {
  lastStudiedLesson: null,
  isLoading: false,
  error: null,
  recordLastStudiedLesson: async () => {},
};

export const {
  mock: mockUseLastStudiedLessonQuery,
  override: overrideMockUseLastStudiedLessonQuery,
  reset: resetMockUseLastStudiedLessonQuery,
} = createOverrideableMock<UseLastStudiedLessonQueryReturn>(defaultMockResult);

export default mockUseLastStudiedLessonQuery;
