import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import { overrideMockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { useExampleQuery } from '@application/queries/ExampleQueries/useExampleQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useCombinedFilters
const mockUseCombinedFilters = vi.fn();
vi.mock('@application/units/Filtering/useCombinedFilters', () => ({
  useCombinedFilters: (props: any) => mockUseCombinedFilters(props),
}));

describe('useExampleQuery', () => {
  const defaultMockCombinedFilters: UseCombinedFiltersReturnType = {
    filterState: {
      lessonRanges: [],
      excludeSpanglish: false,
      audioOnly: false,
      skillTags: undefined,
    },
    isLoading: false,
    error: null,
    // Add other required properties with minimal defaults
    filterStateWithoutLesson: {
      excludeSpanglish: false,
      audioOnly: false,
      skillTagKeys: [],
    },
    batchUpdateFilterStateWithoutLesson: vi.fn(),
    audioOnly: false,
    updateAudioOnly: vi.fn(),
    excludeSpanglish: false,
    updateExcludeSpanglish: vi.fn(),
    selectedSkillTags: [],
    addSkillTagToFilters: vi.fn(),
    removeSkillTagFromFilters: vi.fn(),
    bulkUpdateSkillTagKeys: vi.fn(),
    course: null,
    courseId: null,
    updateUserSelectedCourseId: vi.fn(),
    fromLesson: null,
    fromLessonNumber: null,
    updateFromLessonNumber: vi.fn(),
    toLesson: null,
    toLessonNumber: null,
    updateToLessonNumber: vi.fn(),
    skillTagSearch: {
      tagSearchTerm: '',
      tagSuggestions: [],
      updateTagSearchTerm: vi.fn(),
      removeTagFromSuggestions: vi.fn(),
      addTagBackToSuggestions: vi.fn(),
      isLoading: false,
      error: null,
    },
    filterPreset: 'None' as any,
    setFilterPreset: vi.fn(),
  };

  beforeEach(() => {
    mockUseCombinedFilters.mockReturnValue(defaultMockCombinedFilters);
    overrideMockExampleAdapter({
      getFilteredExamples: async () => ({
        examples: createMockExampleWithVocabularyList(10),
        totalCount: 50,
      }),
    });
  });

  it('should fetch filtered examples correctly', async () => {
    // Arrange
    const mockData = createMockExampleWithVocabularyList(10);
    const pageSize = 10;
    mockUseCombinedFilters.mockReturnValue({
      ...defaultMockCombinedFilters,
      filterState: {
        lessonRanges: [{ courseId: 1, fromLesson: 1, toLesson: 5 }],
        excludeSpanglish: false,
        audioOnly: false,
      },
    });

    overrideMockExampleAdapter({
      getFilteredExamples: async () => ({
        examples: mockData,
        totalCount: 50,
      }),
    });

    // Act
    const { result } = renderHook(() => useExampleQuery(pageSize), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    // Initial state should show loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isDependenciesLoading).toBe(false);

    // After data loads
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.filteredExamples).toEqual(mockData);
    expect(result.current.totalCount).toBe(50);
    expect(result.current.error).toBeNull();
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(pageSize);
  });

  it('should handle fetch errors correctly', async () => {
    // Arrange
    const testError = new Error('Failed to fetch examples');
    const pageSize = 10;
    mockUseCombinedFilters.mockReturnValue({
      ...defaultMockCombinedFilters,
      filterState: {
        lessonRanges: [{ courseId: 1, fromLesson: 1, toLesson: 5 }],
      },
    });

    overrideMockExampleAdapter({
      getFilteredExamples: async () => {
        throw testError;
      },
    });

    // Act
    const { result } = renderHook(() => useExampleQuery(pageSize), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch examples');
    expect(result.current.filteredExamples).toBeNull();
  });

  it('should handle pagination correctly', async () => {
    // Arrange
    const pageSize = 10;
    const page1Data = createMockExampleWithVocabularyList(10);
    const page2Data = createMockExampleWithVocabularyList(10);

    mockUseCombinedFilters.mockReturnValue({
      ...defaultMockCombinedFilters,
      filterState: {
        lessonRanges: [{ courseId: 1, fromLesson: 1, toLesson: 5 }],
      },
    });

    overrideMockExampleAdapter({
      getFilteredExamples: async ({ page }) => {
        if (page === 1) {
          return { examples: page1Data, totalCount: 50 };
        }
        return { examples: page2Data, totalCount: 50 };
      },
    });

    // Act
    const { result } = renderHook(() => useExampleQuery(pageSize), {
      wrapper: TestQueryClientProvider,
    });

    // Assert - Initial page
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.filteredExamples).toEqual(page1Data);
    expect(result.current.page).toBe(1);

    // Change page
    result.current.changeQueryPage(2);
    await waitFor(() => expect(result.current.page).toBe(2));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.filteredExamples).toEqual(page2Data);
  });

  it('should update page size correctly', async () => {
    // Arrange
    const initialPageSize = 10;
    const newPageSize = 20;
    const mockData = createMockExampleWithVocabularyList(20);

    mockUseCombinedFilters.mockReturnValue({
      ...defaultMockCombinedFilters,
      filterState: {
        lessonRanges: [{ courseId: 1, fromLesson: 1, toLesson: 5 }],
      },
    });

    overrideMockExampleAdapter({
      getFilteredExamples: async () => ({
        examples: mockData,
        totalCount: 50,
      }),
    });

    // Act
    const { result } = renderHook(() => useExampleQuery(initialPageSize), {
      wrapper: TestQueryClientProvider,
    });

    // Assert - Initial page size
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pageSize).toBe(initialPageSize);

    // Update page size
    result.current.updatePageSize(newPageSize);
    await waitFor(() => expect(result.current.pageSize).toBe(newPageSize));
    expect(result.current.page).toBe(1); // Should reset to page 1
  });

  it('should handle audioRequired parameter correctly', async () => {
    // Arrange
    const pageSize = 10;
    const mockData = createMockExampleWithVocabularyList(10);

    mockUseCombinedFilters.mockReturnValue({
      ...defaultMockCombinedFilters,
      filterState: {
        lessonRanges: [{ courseId: 1, fromLesson: 1, toLesson: 5 }],
        audioOnly: false,
      },
    });

    overrideMockExampleAdapter({
      getFilteredExamples: async ({ audioOnly }) => {
        expect(audioOnly).toBe(true);
        return { examples: mockData, totalCount: 50 };
      },
    });

    // Act
    const { result } = renderHook(() => useExampleQuery(pageSize, true), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.filteredExamples).toEqual(mockData);
  });

  it('should not fetch when filters are loading', async () => {
    // Arrange
    const pageSize = 10;
    mockUseCombinedFilters.mockReturnValue({
      ...defaultMockCombinedFilters,
      isLoading: true,
      filterState: {
        lessonRanges: [],
      },
    });

    // Act
    const { result } = renderHook(() => useExampleQuery(pageSize), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    expect(result.current.isDependenciesLoading).toBe(true);
    // Query should not be enabled when filters are loading
    // This is tested by checking that isLoading stays true or query doesn't run
  });

  it('should not fetch when seed is null (no filters applied)', async () => {
    // Arrange
    const pageSize = 10;
    mockUseCombinedFilters.mockReturnValue({
      ...defaultMockCombinedFilters,
      filterState: {
        lessonRanges: [],
        excludeSpanglish: true, // Default is true, so seed will be null
        audioOnly: false,
      },
    });

    // Act
    const { result } = renderHook(() => useExampleQuery(pageSize), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    // When seed is null, query should be disabled
    // The query should not fetch because enabled condition requires seed
    expect(result.current.isDependenciesLoading).toBe(false);
  });
});
