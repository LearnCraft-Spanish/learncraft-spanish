import type { UseStudentFlashcardsReturnType } from '@application/queries/useStudentFlashcards';
import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';
import type { Flashcard } from '@learncraft-spanish/shared';
import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';
import useExampleFilter from '@application/units/useExampleFilter';
import { useMemo } from 'react';
import usePagination from '../units/Pagination/usePagination';

export interface UseFlashcardManagerReturnType {
  exampleFilter: UseExampleFilterReturnType;
  allFlashcards: Flashcard[] | undefined;
  paginationState: ReturnType<typeof usePagination>;
  pageSize: number;
}

export default function useFlashcardManager(): UseFlashcardManagerReturnType {
  const exampleFilter: UseExampleFilterReturnType = useExampleFilter();
  const pageSize = 25;

  const flashcardsQuery: UseStudentFlashcardsReturnType =
    useStudentFlashcards();

  const displayOrder = useMemo(() => {
    if (flashcardsQuery.flashcards === undefined || flashcardsQuery.isLoading) {
      return [];
    }

    return (
      flashcardsQuery.flashcards?.map((flashcard) => ({
        recordId: flashcard.id,
      })) ?? []
    );
  }, [flashcardsQuery.flashcards, flashcardsQuery.isLoading]);

  const paginationState = usePagination({
    itemsPerPage: pageSize,
    displayOrder,
  });

  return {
    exampleFilter,
    allFlashcards: flashcardsQuery.flashcards,
    paginationState,
    pageSize,
  };
}
