import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';
import type { UseStudentFlashcardsReturnType } from '@application/units/useStudentFlashcards';
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import type { UseFlashcardManagerReturnType } from './useFlashcardManager.types';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import useFilterOwnedFlashcards from '@application/coordinators/hooks/useFilterOwnedFlashcards';

import {
  useLessonRangeVocabRequired,
  useLessonVocabKnown,
} from '@application/queries/useLessonWithVocab';
import usePagination from '@application/units/Pagination/usePagination';

import useExampleFilter from '@application/units/useExampleFilter';
import useLessonPopup from '@application/units/useLessonPopup';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { filterExamplesCombined } from '@learncraft-spanish/shared';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useFlashcardManager(): UseFlashcardManagerReturnType {
  const navigate = useNavigate();
  const { isLoading: activeStudentIsLoading } = useActiveStudent();
  const { isLoading: authUserIsLoading } = useAuthAdapter();
  const { lessonPopup } = useLessonPopup();
  const { filterOwnedFlashcards, setFilterOwnedFlashcards } =
    useFilterOwnedFlashcards();
  const exampleFilter: UseExampleFilterReturnType = useExampleFilter();
  const { courseAndLessonState, filterState: coordinatorFilterState } =
    exampleFilter;
  const { filterState } = coordinatorFilterState;
  const pageSize = 25;

  const setFiltersEnabled = useCallback(
    (b: boolean) => {
      setFilterOwnedFlashcards(b);
    },
    [setFilterOwnedFlashcards],
  );

  const flashcardsQuery: UseStudentFlashcardsReturnType =
    useStudentFlashcards();

  const fromLessonWithVocabQuery = useLessonRangeVocabRequired(
    courseAndLessonState.course?.id,
    courseAndLessonState.fromLesson?.lessonNumber,
    courseAndLessonState.toLesson?.lessonNumber,
    filterOwnedFlashcards,
  );

  const fromLessonVocabIds: number[] = useMemo(() => {
    return fromLessonWithVocabQuery.data ?? [];
  }, [fromLessonWithVocabQuery.data]);

  const toLessonWithVocabQuery = useLessonVocabKnown(
    courseAndLessonState.course?.id,
    courseAndLessonState.toLesson?.lessonNumber,
    filterOwnedFlashcards,
  );

  const toLessonVocabIds: number[] = useMemo(() => {
    return toLessonWithVocabQuery.data ?? [];
  }, [toLessonWithVocabQuery.data]);

  const findMore = useCallback(() => {
    navigate('/flashcardfinder', { replace: true });
  }, [navigate]);

  const ownedExamples: ExampleWithVocabulary[] = useMemo(() => {
    const mappedExamples: ExampleWithVocabulary[] =
      flashcardsQuery.flashcards?.map((flashcard) => {
        return flashcard.example;
      }) ?? [];
    return mappedExamples;
  }, [flashcardsQuery.flashcards]);

  const filteredFlashcards = useMemo(() => {
    if (!filterOwnedFlashcards) {
      return flashcardsQuery.flashcards ?? [];
    }

    const filteredExamples: ExampleWithVocabulary[] = filterExamplesCombined(
      ownedExamples,
      {
        allowedVocabulary: toLessonVocabIds,
        requiredVocabulary: fromLessonVocabIds,
        excludeSpanglish: filterState.excludeSpanglish,
        audioOnly: filterState.audioOnly,
        skillTags: filterState.skillTags,
      },
    );

    const flashcardsMapped: Flashcard[] =
      flashcardsQuery.flashcards?.filter((flashcard) =>
        filteredExamples.some((example) => example.id === flashcard.example.id),
      ) ?? [];

    return flashcardsMapped;
  }, [
    ownedExamples,
    fromLessonVocabIds,
    toLessonVocabIds,
    filterState,
    flashcardsQuery.flashcards,
    filterOwnedFlashcards,
  ]);

  const displayOrder = useMemo(() => {
    if (!filteredFlashcards) {
      return [];
    }

    return filteredFlashcards.map((flashcard) => ({
      recordId: flashcard.id,
    }));
  }, [filteredFlashcards]);

  const paginationState = usePagination({
    itemsPerPage: pageSize,
    displayOrder,
  });

  return {
    exampleFilter,
    filteredFlashcards,
    paginationState,
    pageSize,
    filtersEnabled: filterOwnedFlashcards,
    toggleFilters: () => setFiltersEnabled(!filterOwnedFlashcards),
    findMore,

    somethingIsLoading:
      flashcardsQuery.isLoading ||
      activeStudentIsLoading ||
      fromLessonWithVocabQuery.isLoading ||
      toLessonWithVocabQuery.isLoading,

    initialLoading:
      flashcardsQuery.isLoading ||
      exampleFilter.initialLoading ||
      activeStudentIsLoading ||
      authUserIsLoading,

    lessonPopup,
  };
}
