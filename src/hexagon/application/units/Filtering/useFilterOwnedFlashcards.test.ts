import type { ExampleFilterStateWithoutLesson } from '@application/coordinators/contexts/ExampleFilterContext';
import type { UseCombinedFiltersWithVocabularyReturnType } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import type { UseSkillTagSearchReturnType } from '@application/units/useSkillTagSearch';
import type { Flashcard } from '@learncraft-spanish/shared';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { useFilterOwnedFlashcards } from '@application/units/Filtering/useFilterOwnedFlashcards';
import {
  mockUseStudentFlashcards,
  overrideMockUseStudentFlashcards,
} from '@application/units/useStudentFlashcards.mock';
import { renderHook } from '@testing-library/react';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Assigned in beforeEach; the mock factory below reads it lazily at render time.
let combinedFiltersValue: UseCombinedFiltersWithVocabularyReturnType;

vi.mock(
  '@application/units/Filtering/useCombinedFiltersWithVocabulary',
  () => ({
    useCombinedFiltersWithVocabulary: vi.fn<
      () => UseCombinedFiltersWithVocabularyReturnType
    >(() => combinedFiltersValue),
  }),
);

const skillTagSearch: UseSkillTagSearchReturnType = {
  tagSearchTerm: '',
  tagSuggestions: [],
  updateTagSearchTerm:
    vi.fn<(target?: EventTarget & HTMLInputElement) => void>(),
  removeTagFromSuggestions: vi.fn<(tagKey: string) => void>(),
  addTagBackToSuggestions: vi.fn<(tagKey: string) => void>(),
  isLoading: false,
  error: null,
};

const createCombinedFilters = (
  overrides: Partial<UseCombinedFiltersWithVocabularyReturnType> = {},
): UseCombinedFiltersWithVocabularyReturnType => ({
  filterState: {
    lessonRanges: [],
    excludeSpanglish: false,
    audioOnly: false,
    skillTags: [],
    includeUnpublished: false,
  },
  filterStateWithoutLesson: {
    excludeSpanglish: false,
    audioOnly: false,
    skillTagKeys: [],
    includeUnpublished: false,
  },
  filterStateWithVocabulary: {
    excludeSpanglish: false,
    audioOnly: false,
    skillTags: [],
    requiredVocabulary: undefined,
    allowedVocabulary: [],
  },
  lessonRangeVocabRequired: undefined,
  lessonVocabKnown: [],
  batchUpdateFilterStateWithoutLesson:
    vi.fn<(filters: ExampleFilterStateWithoutLesson) => void>(),
  audioOnly: false,
  updateAudioOnly: vi.fn<(audioOnly: boolean) => void>(),
  excludeSpanglish: false,
  updateExcludeSpanglish: vi.fn<(excludeSpanglish: boolean) => void>(),
  includeUnpublished: false,
  updateIncludeUnpublished: vi.fn<(includeUnpublished: boolean) => void>(),
  selectedSkillTags: [],
  outOfRangeSkillTagKeys: [],
  addSkillTagToFilters: vi.fn<(tagKey: string) => void>(),
  removeSkillTagFromFilters: vi.fn<(tagKey: string) => void>(),
  bulkUpdateSkillTagKeys: vi.fn<(skillTagKeys: string[]) => void>(),
  course: null,
  courseId: null,
  updateUserSelectedCourseId: vi.fn<(courseId: number) => void>(),
  fromLesson: null,
  fromLessonNumber: null,
  updateFromLessonNumber: vi.fn<(lessonNumber: number) => void>(),
  toLesson: null,
  toLessonNumber: null,
  updateToLessonNumber: vi.fn<(lessonNumber: number) => void>(),
  skillTagSearch,
  filterPreset: PreSetQuizPreset.None,
  setFilterPreset: vi.fn<(preset: PreSetQuizPreset) => void>(),
  coursesWithLessons: [],
  isAdmin: false,
  isLoading: false,
  error: null,
  ...overrides,
});

/** Empty vocabulary keeps the shared vocabulary filter out of the way. */
const createFlashcard = (id: number, spanglish: boolean): Flashcard => {
  const flashcard = createMockFlashcard({ id });
  return {
    ...flashcard,
    id,
    example: { ...flashcard.example, id, spanglish, vocabulary: [] },
  };
};

const ownedFlashcards: Flashcard[] = [
  createFlashcard(1, false),
  createFlashcard(2, true),
];

const renderFilter = (filterOwnedFlashcards: boolean) =>
  renderHook(() => useFilterOwnedFlashcards(filterOwnedFlashcards));

describe('useFilterOwnedFlashcards', () => {
  beforeEach(() => {
    combinedFiltersValue = createCombinedFilters();
    overrideMockUseStudentFlashcards({
      flashcards: ownedFlashcards,
      collectedExamples: ownedFlashcards.map((flashcard) => flashcard.example),
    });
  });

  it('returns the very combined-filters instance it subscribed to', () => {
    const { result } = renderFilter(false);

    expect(result.current.combinedFilters).toBe(combinedFiltersValue);
  });

  it('returns the very student-flashcards instance it subscribed to', () => {
    const { result } = renderFilter(false);

    expect(result.current.flashcardsQuery).toBe(mockUseStudentFlashcards);
  });

  it('returns every owned flashcard when filtering is off', () => {
    const { result } = renderFilter(false);

    expect(result.current.filteredFlashcards).toEqual(ownedFlashcards);
  });

  it('applies the active filters to the owned flashcards when filtering is on', () => {
    combinedFiltersValue = createCombinedFilters({ excludeSpanglish: true });

    const { result } = renderFilter(true);

    expect(
      result.current.filteredFlashcards.map(
        (flashcard) => flashcard.example.id,
      ),
    ).toEqual([1]);
  });

  it('reports an empty list when the owned flashcards have not loaded', () => {
    overrideMockUseStudentFlashcards({
      flashcards: undefined,
      collectedExamples: undefined,
    });

    const { result } = renderFilter(false);

    expect(result.current.filteredFlashcards).toEqual([]);
  });

  it('reports an empty list when filtering is on and nothing has loaded', () => {
    overrideMockUseStudentFlashcards({
      flashcards: undefined,
      collectedExamples: undefined,
    });

    const { result } = renderFilter(true);

    expect(result.current.filteredFlashcards).toEqual([]);
  });

  it('surfaces the loading and error states of both subscriptions', () => {
    const error = new Error('failed to load owned flashcards');
    combinedFiltersValue = createCombinedFilters({ isLoading: true });
    overrideMockUseStudentFlashcards({ isLoading: true, error });

    const { result } = renderFilter(false);

    expect(result.current.studentFlashcardsLoading).toBe(true);
    expect(result.current.filteredFlashcardsLoading).toBe(true);
    expect(result.current.error).toBe(error);
  });
});
