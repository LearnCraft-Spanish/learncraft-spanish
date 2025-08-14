import mockSelectedCourseAndLessons, {
  overrideMockSelectedCourseAndLessons,
} from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';

import mockUseSpellingsKnownForLesson, {
  overrideMockUseSpellingsKnownForLesson,
} from '@application/queries/useSpellingsKnownForLesson/useSpellingsKnownForLesson.mock';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockSpellingsData } from 'src/hexagon/testing/factories/spellingsFactory';
import { TestQueryClientProvider } from 'src/hexagon/testing/providers/TestQueryClientProvider';
import { vi } from 'vitest';

import useFrequensay from './useFrequensay';

vi.mock('@application/queries/useSpellingsKnownForLesson/', () => ({
  useSpellingsKnownForLesson: () => mockUseSpellingsKnownForLesson,
}));
vi.mock('@application/coordinators/hooks/useSelectedCourseAndLessons', () => ({
  useSelectedCourseAndLessons: () => mockSelectedCourseAndLessons,
}));

describe('useFrequensay', () => {
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
    overrideMockUseSpellingsKnownForLesson({
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
