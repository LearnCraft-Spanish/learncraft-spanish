import type { UseSpellingsKnownForLessonRangeResult } from './useSpellingsKnownForLessonRange';
import { createMockSpellingsData } from '@testing/factories/spellingsFactory';
import { createTypedMock } from '@testing/utils/typedMock';

// Default mock implementation
export const defaultSuccessMockResult: UseSpellingsKnownForLessonRangeResult = {
  data: undefined,
  isLoading: false,
  error: null,
};

export const mockUseSpellingsKnownForLessonRange = createTypedMock<
  (params: {
    courseName?: string;
    lessonToNumber?: number;
    lessonFromNumber?: number;
    isFrequensayEnabled?: boolean;
  }) => UseSpellingsKnownForLessonRangeResult
>().mockReturnValue(defaultSuccessMockResult);

export const overrideMockUseSpellingsKnownForLessonRange = (
  config: Partial<UseSpellingsKnownForLessonRangeResult> = {},
) => {
  const mockResult = {
    ...defaultSuccessMockResult,
    ...config,
  };

  mockUseSpellingsKnownForLessonRange.mockReturnValue(mockResult);
  return mockResult;
};

export const callMockUseSpellingsKnownForLessonRange = (
  params: {
    courseName?: string;
    lessonToNumber?: number;
    lessonFromNumber?: number;
    isFrequensayEnabled?: boolean;
  } = {},
) => {
  if (
    params.isFrequensayEnabled &&
    params.courseName &&
    params.lessonToNumber
  ) {
    return overrideMockUseSpellingsKnownForLessonRange({
      data: createMockSpellingsData(
        params.lessonToNumber - (params.lessonFromNumber || 0),
      ),
    });
  } else {
    return mockUseSpellingsKnownForLessonRange(params);
  }
};

export default mockUseSpellingsKnownForLessonRange;
