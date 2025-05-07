import type { UseSpellingsKnownForLessonRangeResult } from './useSpellingsKnownForLessonRange';
import { createMockSpellingsData } from '@testing/factories/spellingsFactory';
import { createTypedMock } from '@testing/utils/typedMock';

// Default mock implementation
const defaultSuccessMockResult: UseSpellingsKnownForLessonRangeResult = {
  data: createMockSpellingsData(10),
  isLoading: false,
  error: null,
};

export const mockUseSpellingsKnownForLessonRange = createTypedMock<
  () => UseSpellingsKnownForLessonRangeResult
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

export const callMockUseSpellingsKnownForLessonRange = () =>
  mockUseSpellingsKnownForLessonRange();

export default mockUseSpellingsKnownForLessonRange;
