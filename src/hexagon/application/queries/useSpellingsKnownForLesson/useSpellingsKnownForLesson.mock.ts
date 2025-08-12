import type { useSpellingsKnownForLessonResult } from './useSpellingsKnownForLesson.types';
import { createMockSpellingsData } from '@testing/factories/spellingsFactory';
import { createTypedMock } from '@testing/utils/typedMock';

// Default mock implementation
export const defaultSuccessMockResult: useSpellingsKnownForLessonResult = {
  data: [],
  isLoading: false,
  error: null,
};

export const mockuseSpellingsKnownForLesson = createTypedMock<
  (params: {
    courseName?: string;
    lessonNumber?: number;
    isFrequensayEnabled?: boolean;
  }) => useSpellingsKnownForLessonResult
>().mockReturnValue(defaultSuccessMockResult);

export const overrideMockuseSpellingsKnownForLesson = (
  config: Partial<useSpellingsKnownForLessonResult> = {},
) => {
  const mockResult = {
    ...defaultSuccessMockResult,
    ...config,
  };

  mockuseSpellingsKnownForLesson.mockReturnValue(mockResult);
  return mockResult;
};

export const callMockuseSpellingsKnownForLesson = (
  params: {
    courseName?: string;
    lessonNumber?: number;
    isFrequensayEnabled?: boolean;
  } = {},
) => {
  if (params.isFrequensayEnabled && params.courseName && params.lessonNumber) {
    return overrideMockuseSpellingsKnownForLesson({
      data: createMockSpellingsData(params.lessonNumber),
    });
  } else {
    return mockuseSpellingsKnownForLesson(params);
  }
};

export default mockuseSpellingsKnownForLesson;
