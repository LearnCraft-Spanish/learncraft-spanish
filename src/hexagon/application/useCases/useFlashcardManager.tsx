import type { UseStudentFlashcardsReturnType } from '@application/queries/useStudentFlashcards';
import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';
import type { UseFlashcardManagerReturnType } from './useFlashcardManager.types';
import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';
import useExampleFilter from '@application/units/useExampleFilter';
import { useMemo } from 'react';
import usePagination from '../units/Pagination/usePagination';
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
