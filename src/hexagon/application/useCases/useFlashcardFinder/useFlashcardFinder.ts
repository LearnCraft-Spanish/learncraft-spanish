import type { UseExampleQueryReturnType } from '@application/queries/ExampleQueries/useExampleQuery';
import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseSkillTagSearchReturnType } from '@application/units/useSkillTagSearch';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared/dist/domain/example/core-types';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { useExampleQuery } from '@application/queries/ExampleQueries/useExampleQuery';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { useQueryPagination } from '@application/units/Pagination/useQueryPagination';
import useLessonPopup from '@application/units/useLessonPopup';
import { useSkillTagSearch } from '@application/units/useSkillTagSearch';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { lessonNumberAfterFilterReset } from '@domain/coursePrerequisites';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface UseFlashcardFinderReturnType {
  pagination: QueryPaginationState;
  exampleFilter: UseCombinedFiltersReturnType;
  exampleQuery: UseExampleQueryReturnType;
  displayExamples: ExampleWithVocabulary[];
  flashcardsQuery: UseStudentFlashcardsReturn;
  totalPages: number | null;
  lessonPopup: LessonPopup;
  skillTagSearch: UseSkillTagSearchReturnType;
  resetFilters: () => void;
  /** Every example matching the current filters, for the copy-all action. */
  copyAllMatchingExamples: () => Promise<ExampleWithVocabulary[]>;
  selectedIds: ReadonlySet<number>;
  changeSelection: (next: ReadonlySet<number>) => void;
  clearSelection: () => void;
  /** Creates flashcards for the selection, skipping ones the student already owns. */
  collectSelected: () => Promise<void>;

  // Loading states similar to FlashcardManager
  filteredExamplesLoading: boolean;
  initialLoading: boolean;
  error: Error | null;
}

export default function useFlashcardFinder(): UseFlashcardFinderReturnType {
  // isCoach or isAdmin
  const { isCoach, isAdmin } = useAuthAdapter();
  const { lessonPopup } = useLessonPopup({ scopeToRelevantCourses: true });

  const QUERY_PAGE_SIZE = 150;
  const PAGE_SIZE = 25;

  const exampleQuery = useExampleQuery(
    QUERY_PAGE_SIZE,
    false,
    isCoach || isAdmin, // disable cache if isCoach or isAdmin
  );

  const pagination: QueryPaginationState = useQueryPagination({
    queryPage: exampleQuery.page,
    pageSize: PAGE_SIZE,
    queryPageSize: QUERY_PAGE_SIZE,
    totalCount: exampleQuery.totalCount ?? undefined,
    changeQueryPage: exampleQuery.changeQueryPage,
  });

  const totalPages = exampleQuery.totalCount
    ? Math.ceil(exampleQuery.totalCount / PAGE_SIZE)
    : null;

  const exampleFilter: UseCombinedFiltersReturnType = useCombinedFilters({});
  const exampleAdapter = useExampleAdapter();

  const copyAllMatchingExamples = async (): Promise<
    ExampleWithVocabulary[]
  > => {
    const { filterState } = exampleFilter;
    const { examples } = await exampleAdapter.getFilteredExamples({
      skillTags: filterState.skillTags,
      lessonRanges: filterState.lessonRanges,
      excludeSpanglish: filterState.excludeSpanglish,
      audioOnly: filterState.audioOnly,
      page: 1,
      limit: 1_000_000,
      seed: uuidv4(),
      disableCache: true,
      includeUnpublished: filterState.includeUnpublished,
    });
    return examples;
  };

  // Track previous filter state to detect actual changes
  const previousFilterState = useRef<string | null>(null);

  // Reset pagination when filter state changes
  useEffect(() => {
    const currentFilterState = JSON.stringify({
      selectedSkillTags: exampleFilter.selectedSkillTags,
      excludeSpanglish: exampleFilter.excludeSpanglish,
      audioOnly: exampleFilter.audioOnly,
      courseId: exampleFilter.courseId,
      fromLessonNumber: exampleFilter.fromLessonNumber,
      toLessonNumber: exampleFilter.toLessonNumber,
    });

    if (
      previousFilterState.current !== null &&
      previousFilterState.current !== currentFilterState
    ) {
      pagination.resetPagination();
    }

    previousFilterState.current = currentFilterState;
  }, [
    exampleFilter.selectedSkillTags,
    exampleFilter.excludeSpanglish,
    exampleFilter.audioOnly,
    exampleFilter.courseId,
    exampleFilter.fromLessonNumber,
    exampleFilter.toLessonNumber,
    pagination,
  ]);

  // Enable prefetching when we're near the end of a query page batch
  // This happens on the last page of each query batch to ensure smooth pagination
  useEffect(() => {
    const isNearEndOfQueryBatch =
      pagination.pageWithinQueryBatch >= pagination.pagesPerQuery / 2;

    exampleQuery.setCanPrefetch(isNearEndOfQueryBatch);
  }, [
    pagination.pageWithinQueryBatch,
    pagination.page,
    pagination.pagesPerQuery,
    exampleQuery,
  ]);

  const startIndex = pagination.pageWithinQueryBatch * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const displayExamples = useMemo(
    () =>
      exampleQuery.filteredExamples
        ? exampleQuery.filteredExamples.slice(startIndex, endIndex)
        : [],
    [exampleQuery.filteredExamples, startIndex, endIndex],
  );

  const flashcardsQuery: UseStudentFlashcardsReturn = useStudentFlashcards();

  const skillTagSearch: UseSkillTagSearchReturnType = useSkillTagSearch();

  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const selectedExamplesRef = useRef<Map<number, ExampleWithVocabulary>>(
    new Map(),
  );

  const changeSelection = useCallback(
    (next: ReadonlySet<number>): void => {
      for (const id of [...selectedExamplesRef.current.keys()]) {
        if (!next.has(id)) {
          selectedExamplesRef.current.delete(id);
        }
      }
      for (const example of displayExamples) {
        if (next.has(example.id)) {
          selectedExamplesRef.current.set(example.id, example);
        }
      }
      setSelectedIds(next);
    },
    [displayExamples],
  );

  const clearSelection = useCallback((): void => {
    selectedExamplesRef.current.clear();
    setSelectedIds(new Set());
  }, []);

  const collectSelected = useCallback(async (): Promise<void> => {
    const toCollect = [...selectedIds]
      .map((id) => selectedExamplesRef.current.get(id))
      .filter(
        (example): example is ExampleWithVocabulary => example !== undefined,
      )
      .filter(
        (example) =>
          !flashcardsQuery.isExampleCollected({ exampleId: example.id }),
      );

    if (toCollect.length > 0) {
      await flashcardsQuery.createFlashcards(toCollect);
    }

    selectedExamplesRef.current.clear();
    setSelectedIds(new Set());
  }, [flashcardsQuery, selectedIds]);

  const resetFilters = (): void => {
    exampleFilter.bulkUpdateSkillTagKeys([]);
    exampleFilter.updateExcludeSpanglish(false);
    exampleFilter.updateAudioOnly(false);
    exampleFilter.updateIncludeUnpublished(false);
    exampleFilter.setFilterPreset(PreSetQuizPreset.None);
    exampleFilter.skillTagSearch.updateTagSearchTerm();

    const lessonNumber = lessonNumberAfterFilterReset(exampleFilter.course);
    if (lessonNumber !== null) {
      exampleFilter.updateFromLessonNumber(lessonNumber);
    }
  };

  return {
    pagination,
    exampleFilter,
    exampleQuery,
    displayExamples,
    flashcardsQuery,
    totalPages,
    lessonPopup,
    skillTagSearch,
    resetFilters,
    copyAllMatchingExamples,
    selectedIds,
    changeSelection,
    clearSelection,
    collectSelected,

    // Loading states similar to FlashcardManager
    initialLoading:
      flashcardsQuery.isLoading ||
      exampleFilter.isLoading ||
      skillTagSearch.isLoading,
    filteredExamplesLoading: exampleQuery.isLoading,
    error: flashcardsQuery.error || exampleFilter.error,
  };
}
