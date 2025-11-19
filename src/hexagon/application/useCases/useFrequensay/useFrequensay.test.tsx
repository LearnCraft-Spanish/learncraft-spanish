import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import { overrideMockUseSpellingsKnownForLesson } from '@application/queries/useSpellingsKnownForLesson/useSpellingsKnownForLesson.mock';
import useFrequensay from '@application/useCases/useFrequensay/useFrequensay';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockSpellingsData } from '@testing/factories/spellingsFactory';

import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';

// We dont need to reset mockUseSpellingsKnownForLesson as it is reset by the setupTests.js file
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
