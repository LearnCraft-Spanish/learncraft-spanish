import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import { useExampleSearch } from '@application/useCases/ExampleSearch/useExampleSearch';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseCombinedFilters = vi.fn();
const mockUseCoursesWithLessons = vi.fn();

vi.mock('@application/units/Filtering/useCombinedFilters', () => ({
  useCombinedFilters: (props: any) => mockUseCombinedFilters(props),
}));

vi.mock('@application/queries/useCoursesWithLessons', () => ({
  useCoursesWithLessons: () => mockUseCoursesWithLessons(),
}));

const createDefaultCombinedFilters = (): UseCombinedFiltersReturnType => ({
  filterState: {
    lessonRanges: [],
    excludeSpanglish: false,
    audioOnly: false,
    skillTags: [],
  },
  isLoading: false,
  error: null,
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
});

describe('useExampleSearch', () => {
  beforeEach(() => {
    mockUseCombinedFilters.mockReturnValue(createDefaultCombinedFilters());
    mockUseCoursesWithLessons.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useExampleSearch());

    expect(mockUseCombinedFilters).toHaveBeenCalledWith({
      onFilterChange: expect.any(Function),
    });
    expect(result.current.mode).toBe('ids');
    expect(result.current.searchIsTriggered).toBe(false);
    expect(result.current.isValidSearch).toBe(false);
    expect(result.current.nonValidSearchErrorMessage).toBe(
      'ERROR: Please enter at least one ID.',
    );
  });

  it('handleChangeMode resets searchIsTriggered', () => {
    const { result } = renderHook(() => useExampleSearch());

    act(() => {
      result.current.triggerSearch();
    });
    expect(result.current.searchIsTriggered).toBe(true);

    act(() => {
      result.current.handleChangeMode('text');
    });

    expect(result.current.mode).toBe('text');
    expect(result.current.searchIsTriggered).toBe(false);
  });

  it('validates text mode when either input has content', () => {
    const { result } = renderHook(() => useExampleSearch());

    act(() => {
      result.current.handleChangeMode('text');
      result.current.searchComponentProps.searchByTextProps.onSpanishInputChange(
        'hola',
      );
    });

    expect(result.current.isValidSearch).toBe(true);
    expect(
      result.current.searchResultProps.textResultsProps.spanishString,
    ).toBe('hola');
  });

  it('validates ids mode when parsed IDs exist', () => {
    const { result } = renderHook(() => useExampleSearch());

    act(() => {
      result.current.handleChangeMode('ids');
      result.current.searchComponentProps.searchByIdsProps.onInputChange(
        '10, 0, abc, 5',
      );
    });

    expect(result.current.isValidSearch).toBe(true);
    expect(result.current.searchResultProps.idsResultsProps.ids).toEqual([
      10, 5,
    ]);
  });

  it('validates quiz mode when course and quiz number are set', () => {
    const { result } = renderHook(() => useExampleSearch());

    act(() => {
      result.current.handleChangeMode('quiz');
      result.current.searchComponentProps.searchByQuizProps.onCourseCodeChange(
        'lcsp',
      );
      result.current.searchComponentProps.searchByQuizProps.onQuizNumberChange(
        2,
      );
    });

    expect(result.current.isValidSearch).toBe(true);
    expect(result.current.searchResultProps.quizResultsProps).toEqual({
      courseCode: 'lcsp',
      quizNumber: 2,
    });
  });

  it('always validates recentlyEdited mode', () => {
    const { result } = renderHook(() => useExampleSearch());

    act(() => {
      result.current.handleChangeMode('recentlyEdited');
    });

    expect(result.current.isValidSearch).toBe(true);
  });

  it('validates filter mode when course is selected and builds lessonRanges', () => {
    const mockUpdateToLessonNumber = vi.fn();
    const mockUpdateFromLessonNumber = vi.fn();
    const mockUpdateUserSelectedCourseId = vi.fn();

    mockUseCombinedFilters.mockReturnValue({
      ...createDefaultCombinedFilters(),
      courseId: 7,
      toLessonNumber: 10,
      updateToLessonNumber: mockUpdateToLessonNumber,
      updateFromLessonNumber: mockUpdateFromLessonNumber,
      updateUserSelectedCourseId: mockUpdateUserSelectedCourseId,
      filterState: {
        lessonRanges: [
          { courseId: 7, fromLessonNumber: 1, toLessonNumber: 10 },
        ],
        excludeSpanglish: false,
        audioOnly: false,
        skillTags: [],
      },
    });

    const { result } = renderHook(() => useExampleSearch());

    act(() => {
      result.current.handleChangeMode('filter');
    });

    expect(result.current.isValidSearch).toBe(true);
    expect(
      result.current.searchResultProps.localFilterResultsProps.lessonRanges,
    ).toEqual([{ courseId: 7, fromLessonNumber: 1, toLessonNumber: 10 }]);
  });

  it('withSearchReset clears searchIsTriggered when inputs change', () => {
    const { result } = renderHook(() => useExampleSearch());

    act(() => {
      result.current.handleChangeMode('text');
      result.current.triggerSearch();
    });
    expect(result.current.searchIsTriggered).toBe(true);

    act(() => {
      result.current.searchComponentProps.searchByTextProps.onEnglishInputChange(
        'hello',
      );
    });

    expect(result.current.searchIsTriggered).toBe(false);
    expect(
      result.current.searchResultProps.textResultsProps.englishString,
    ).toBe('hello');
  });
});
