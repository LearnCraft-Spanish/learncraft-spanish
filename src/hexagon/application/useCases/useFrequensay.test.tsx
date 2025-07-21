import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import mockuseSpellingsKnownForLesson, {
  callMockuseSpellingsKnownForLesson,
  defaultSuccessMockResult,
  overrideMockuseSpellingsKnownForLesson,
} from '@application/units/useSpellingsKnownForLesson.mock';

import { renderHook, waitFor } from '@testing-library/react';
import { createMockSpellingsData } from 'src/hexagon/testing/factories/spellingsFactory';
import { TestQueryClientProvider } from 'src/hexagon/testing/providers/TestQueryClientProvider';
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
vi.mock('@application/units/useSpellingsKnownForLesson', () => ({
  useSpellingsKnownForLesson: callMockuseSpellingsKnownForLesson,
}));

describe('useFrequensay', () => {
  beforeEach(() => {
    mockuseSpellingsKnownForLesson.mockReturnValue(defaultSuccessMockResult);
    mockUseCustomVocabulary.mockReturnValue(mockUseCustomVocabularyReturnValue);
    mockUseSelectedLesson.mockReturnValue(mockUseSelectedLessonReturnValue);
  });

  it('should render with default state', async () => {
    const { result } = renderHook(() => useFrequensay(), {
      wrapper: ({ children }) => (
        <TestQueryClientProvider>
          <SelectedCourseAndLessonsProvider>
            {children}
          </SelectedCourseAndLessonsProvider>
        </TestQueryClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.spellingsDataError).toBe(null);
      expect(result.current.spellingsDataLoading).toBe(false);
    });
  });

  it('render with data, when query is successful', async () => {
    const mockData = createMockSpellingsData(1);
    overrideMockuseSpellingsKnownForLesson({
      data: mockData,
    });

    const { result } = renderHook(() => useFrequensay(), {
      wrapper: ({ children }) => (
        <TestQueryClientProvider>
          <SelectedCourseAndLessonsProvider>
            {children}
          </SelectedCourseAndLessonsProvider>
        </TestQueryClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.spellingsDataError).toBe(null);
      expect(result.current.spellingsDataLoading).toBe(false);
      expect(result.current.spellingsData).toBe(mockData);
    });
  });
});
