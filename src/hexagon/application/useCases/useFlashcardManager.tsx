import type { UseStudentFlashcardsReturnType } from '@application/queries/useStudentFlashcards';
import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import type { UseFlashcardManagerReturnType } from './useFlashcardManager.types';
import { useLessonWithVocab } from '@application/queries/useLessonWithVocab';
import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';
import usePagination from '@application/units/Pagination/usePagination';

import useExampleFilter from '@application/units/useExampleFilter';
import { filterExamplesCombined } from '@learncraft-spanish/shared';

import { useMemo, useState } from 'react';

export default function useFlashcardManager(): UseFlashcardManagerReturnType {
  const exampleFilter: UseExampleFilterReturnType = useExampleFilter();
  const { courseAndLessonState, filterState: coordinatorFilterState } =
    exampleFilter;
  const { filterState } = coordinatorFilterState;
  const pageSize = 25;

  const [filtersEnabled, setFiltersEnabled] = useState(false);

  const flashcardsQuery: UseStudentFlashcardsReturnType =
    useStudentFlashcards();

  const fromLessonWithVocabQuery = useLessonWithVocab(
    courseAndLessonState.course?.id,
    courseAndLessonState.fromLesson?.lessonNumber,
  );

  const fromLessonVocabIds: number[] = useMemo(() => {
    return (
      fromLessonWithVocabQuery.data?.vocabKnown?.map((vocab) => vocab.id) ?? []
    );
  }, [fromLessonWithVocabQuery.data]);

  const toLessonWithVocabQuery = useLessonWithVocab(
    courseAndLessonState.course?.id,
    courseAndLessonState.toLesson?.lessonNumber,
  );

  const toLessonVocabIds: number[] = useMemo(() => {
    return (
      toLessonWithVocabQuery.data?.vocabKnown?.map((vocab) => vocab.id) ?? []
    );
  }, [toLessonWithVocabQuery.data]);

  const ownedExamples: ExampleWithVocabulary[] = useMemo(() => {
    const mappedExamples: ExampleWithVocabulary[] =
      flashcardsQuery.flashcards?.map((flashcard) => {
        return flashcard.example;
      }) ?? [];
    return mappedExamples;
  }, [flashcardsQuery.flashcards]);

  const filteredFlashcards = useMemo(() => {
    if (!filtersEnabled) {
      return flashcardsQuery.flashcards ?? [];
    }

    const filteredExamples: ExampleWithVocabulary[] = filterExamplesCombined(
      ownedExamples,
      {
        vocabAllowed: toLessonVocabIds,
        vocabRequired: fromLessonVocabIds,
        vocabKnown: fromLessonVocabIds,
        includeSpanglish: filterState.includeSpanglish,
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
    filtersEnabled,
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

    filtersEnabled,
    toggleFilters: () => setFiltersEnabled(!filtersEnabled),
  };
}
