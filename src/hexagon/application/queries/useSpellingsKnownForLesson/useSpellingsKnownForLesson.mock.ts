import type { useSpellingsKnownForLessonResult } from './useSpellingsKnownForLesson.types';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockResult: useSpellingsKnownForLessonResult = {
  data: [],
  isLoading: false,
  error: null,
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseSpellingsKnownForLesson,
  override: overrideMockUseSpellingsKnownForLesson,
  reset: resetMockUseSpellingsKnownForLesson,
} = createOverrideableMock<useSpellingsKnownForLessonResult>(defaultMockResult);

export default mockUseSpellingsKnownForLesson;
