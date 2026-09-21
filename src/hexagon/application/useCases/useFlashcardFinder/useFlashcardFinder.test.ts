import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type {
  CourseWithLessons,
  ExampleWithVocabulary,
} from '@learncraft-spanish/shared';
import {
  overrideMockExampleAdapter,
  resetMockExampleAdapter,
} from '@application/adapters/exampleAdapter.mock';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import {
  overrideMockUseStudentFlashcards,
  resetMockUseStudentFlashcards,
} from '@application/units/useStudentFlashcards.mock';
import useFlashcardFinder from '@application/useCases/useFlashcardFinder';
import { act, renderHook } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let exampleFilter: UseCombinedFiltersReturnType;
let filteredExamples: ExampleWithVocabulary[] = [];
const lessonPopupCalls: unknown[] = [];

vi.mock('@application/units/useLessonPopup', () => ({
  default: (options?: unknown) => {
    lessonPopupCalls.push(options);
    return {
      lessonPopup: { lessonsByVocabulary: [], lessonsLoading: false },
    };
  },
}));

vi.mock('@application/queries/ExampleQueries/useExampleQuery', () => ({
  useExampleQuery: () => ({
    isLoading: false,
    isDependenciesLoading: false,
    filteredExamples,
    totalCount: filteredExamples.length,
    error: null,
    page: 1,
    pageSize: 150,
    changeQueryPage: vi.fn(),
    setCanPrefetch: vi.fn(),
    updatePageSize: vi.fn(),
  }),
}));

vi.mock('@application/units/Filtering/useCombinedFilters', () => ({
  useCombinedFilters: () => exampleFilter,
}));

vi.mock('@application/units/useSkillTagSearch', () => ({
  useSkillTagSearch: () => ({
    tagSearchTerm: '',
    tagSuggestions: [],
    updateTagSearchTerm: vi.fn(),
    removeTagFromSuggestions: vi.fn(),
    addTagBackToSuggestions: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

function createExampleFilter(
  course: CourseWithLessons | null,
): UseCombinedFiltersReturnType {
  return {
    course,
    bulkUpdateSkillTagKeys: vi.fn<(skillTagKeys: string[]) => void>(),
    updateExcludeSpanglish: vi.fn<(excludeSpanglish: boolean) => void>(),
    updateAudioOnly: vi.fn<(audioOnly: boolean) => void>(),
    updateIncludeUnpublished: vi.fn<(includeUnpublished: boolean) => void>(),
    setFilterPreset: vi.fn<(preset: PreSetQuizPreset) => void>(),
    updateFromLessonNumber: vi.fn<(lessonNumber: number) => void>(),
    skillTagSearch: {
      updateTagSearchTerm:
        vi.fn<(target?: EventTarget & HTMLInputElement) => void>(),
    },
    filterState: {
      lessonRanges: [{ courseId: 2, fromLessonNumber: 1, toLessonNumber: 3 }],
      excludeSpanglish: true,
      audioOnly: true,
      skillTags: [],
      includeUnpublished: false,
    },
    isLoading: false,
    error: null,
  } as unknown as UseCombinedFiltersReturnType;
}

describe('useFlashcardFinder', () => {
  beforeEach(() => {
    lessonPopupCalls.length = 0;
    filteredExamples = [];
    exampleFilter = createExampleFilter(null);
    resetMockExampleAdapter();
    resetMockUseStudentFlashcards();
  });

  it('scopes the lesson popup to the relevant courses', () => {
    renderHook(() => useFlashcardFinder());

    expect(lessonPopupCalls).toContainEqual({ scopeToRelevantCourses: true });
  });

  it('clears tags, toggles, and preset without moving the lesson range when no course is selected', () => {
    const { result } = renderHook(() => useFlashcardFinder());

    act(() => {
      result.current.resetFilters();
    });

    expect(exampleFilter.bulkUpdateSkillTagKeys).toHaveBeenCalledWith([]);
    expect(exampleFilter.updateExcludeSpanglish).toHaveBeenCalledWith(false);
    expect(exampleFilter.updateAudioOnly).toHaveBeenCalledWith(false);
    expect(exampleFilter.updateIncludeUnpublished).toHaveBeenCalledWith(false);
    expect(exampleFilter.setFilterPreset).toHaveBeenCalledWith(
      PreSetQuizPreset.None,
    );
    expect(exampleFilter.skillTagSearch.updateTagSearchTerm).toHaveBeenCalled();
    expect(exampleFilter.updateFromLessonNumber).not.toHaveBeenCalled();
  });

  it('snaps a prerequisite course back to its virtual lesson', () => {
    exampleFilter = createExampleFilter({
      id: 7,
      name: 'Post-Podcast Lessons',
      published: true,
      lessons: [{ id: 1, lessonNumber: 4, courseName: 'Post-Podcast Lessons' }],
    });

    const { result } = renderHook(() => useFlashcardFinder());

    act(() => {
      result.current.resetFilters();
    });

    expect(exampleFilter.updateFromLessonNumber).toHaveBeenCalledWith(-7001);
  });

  it('snaps a normal course back to its first lesson', () => {
    exampleFilter = createExampleFilter({
      id: 2,
      name: 'LearnCraft Spanish',
      published: true,
      lessons: [
        { id: 71, lessonNumber: 3, courseName: 'LearnCraft Spanish' },
        { id: 79, lessonNumber: 10, courseName: 'LearnCraft Spanish' },
      ],
    });

    const { result } = renderHook(() => useFlashcardFinder());

    act(() => {
      result.current.resetFilters();
    });

    expect(exampleFilter.updateFromLessonNumber).toHaveBeenCalledWith(3);
  });

  it('returns every example matching the current filters', async () => {
    const examples = createMockExampleWithVocabularyList(2);
    const getFilteredExamples = vi.fn(async () => ({
      examples,
      totalCount: examples.length,
    }));
    overrideMockExampleAdapter({ getFilteredExamples });

    const { result } = renderHook(() => useFlashcardFinder());
    await expect(result.current.copyAllMatchingExamples()).resolves.toEqual(
      examples,
    );
    expect(getFilteredExamples).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonRanges: [{ courseId: 2, fromLessonNumber: 1, toLessonNumber: 3 }],
        excludeSpanglish: true,
        audioOnly: true,
        includeUnpublished: false,
        page: 1,
        limit: 1_000_000,
        disableCache: true,
      }),
    );
  });

  it('rejects when the example catalog cannot be loaded', async () => {
    overrideMockExampleAdapter({
      getFilteredExamples: vi.fn(async () => {
        throw new Error('catalog down');
      }),
    });

    const { result } = renderHook(() => useFlashcardFinder());
    await expect(result.current.copyAllMatchingExamples()).rejects.toThrow(
      'catalog down',
    );
  });

  it('collects the selected examples the student does not already own', async () => {
    const examples = createMockExampleWithVocabularyList(2);
    filteredExamples = examples;
    const createFlashcards = vi.fn(async () => []);
    overrideMockUseStudentFlashcards({
      createFlashcards,
      isExampleCollected: ({ exampleId }) => exampleId === examples[0].id,
    });

    const { result } = renderHook(() => useFlashcardFinder());

    act(() => {
      result.current.changeSelection(
        new Set(examples.map((example) => example.id)),
      );
    });
    await act(async () => {
      await result.current.collectSelected();
    });

    expect(createFlashcards).toHaveBeenCalledWith([examples[1]]);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('does not create flashcards when every selected example is already owned', async () => {
    const examples = createMockExampleWithVocabularyList(1);
    filteredExamples = examples;
    const createFlashcards = vi.fn(async () => []);
    overrideMockUseStudentFlashcards({
      createFlashcards,
      isExampleCollected: () => true,
    });

    const { result } = renderHook(() => useFlashcardFinder());

    act(() => {
      result.current.changeSelection(new Set([examples[0].id]));
    });
    await act(async () => {
      await result.current.collectSelected();
    });

    expect(createFlashcards).not.toHaveBeenCalled();
    expect(result.current.selectedIds.size).toBe(0);
  });
});
