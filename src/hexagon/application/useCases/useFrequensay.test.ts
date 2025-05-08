import mockUseSpellingsKnownForLessonRange, {
  callMockUseSpellingsKnownForLessonRange,
  defaultSuccessMockResult,
  overrideMockUseSpellingsKnownForLessonRange,
} from '@application/units/useSpellingsKnownForLessonRange.mock';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '@testing/index';
import { createMockSpellingsData } from 'src/hexagon/testing/factories/spellingsFactory';

import callMockUseSelectedLesson, {
  mockUseSelectedLesson,
  mockUseSelectedLessonReturnValue,
} from 'src/hooks/useSelectedLesson.mock';
import { vi } from 'vitest';
import mockUseCustomVocabulary, {
  callMockUseCustomVocabulary,
  mockUseCustomVocabularyReturnValue,
} from './useCustomVocabulary.mock';
import { useFrequensay } from './useFrequensay';

vi.mock('./useCustomVocabulary', () => ({
  default: callMockUseCustomVocabulary,
}));
vi.mock('src/hooks/useSelectedLesson', () => ({
  useSelectedLesson: callMockUseSelectedLesson,
}));
vi.mock('@application/units/useSpellingsKnownForLessonRange', () => ({
  useSpellingsKnownForLessonRange: callMockUseSpellingsKnownForLessonRange,
}));

describe('useFrequensay', () => {
  beforeEach(() => {
    mockUseSpellingsKnownForLessonRange.mockReturnValue(
      defaultSuccessMockResult,
    );
    mockUseCustomVocabulary.mockReturnValue(mockUseCustomVocabularyReturnValue);
    mockUseSelectedLesson.mockReturnValue(mockUseSelectedLessonReturnValue);
  });

  it('should render with default state', async () => {
    const { result } = renderHook(() => useFrequensay(), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.data).toBe(undefined);
    });
  });

  it('render with data, when query is successful', async () => {
    const mockData = createMockSpellingsData(1);
    overrideMockUseSpellingsKnownForLessonRange({
      data: mockData,
    });

    const { result } = renderHook(() => useFrequensay(), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(mockData);
    });
  });
});
