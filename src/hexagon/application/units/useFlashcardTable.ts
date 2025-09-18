import type { Flashcard } from '@learncraft-spanish/shared';
import type { PaginationState } from './Pagination/usePagination';
import type { LessonPopup } from './useLessonPopup';
import { useCallback, useMemo, useState } from 'react';
import useLessonPopup from './useLessonPopup';
import { useStudentFlashcards } from './useStudentFlashcards';

export interface UseFlashcardTableProps {
  allFlashcards: Flashcard[];
  displayFlashcards: Flashcard[];
  paginationState: PaginationState;
  onGoingToQuiz: () => void;
  isLoading: boolean;
  error: Error | null;
}

export interface UseFlashcardTableReturn {
  allFlashcards: Flashcard[];
  displayFlashcards: Flashcard[];
  paginationState: PaginationState;
  onGoingToQuiz: () => void;
  error: Error | null;
  selectedIds: number[];
  isSelected: (id: number) => boolean;
  addToSelectedIds: (id: number) => void;
  removeFromSelectedIds: (id: number) => void;
  selectAllOnPage: () => void;
  clearSelection: () => void;
  deleteFlashcard: (id: number) => Promise<number>;
  deleteSelectedFlashcards: () => Promise<number>;
  isSomethingPending: boolean;
  lessonPopup: LessonPopup;
  isRemovingFlashcard: (id: number) => boolean;
}

export function useFlashcardTable({
  allFlashcards,
  displayFlashcards,
  paginationState,
  onGoingToQuiz,
  error,
}: UseFlashcardTableProps): UseFlashcardTableReturn {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const safeSelectedIds = useMemo(() => {
    return selectedIds.filter((id) =>
      displayFlashcards.some((flashcard) => flashcard.example.id === id),
    );
  }, [selectedIds, displayFlashcards]);

  const isSelected = useCallback(
    (id: number) => {
      return safeSelectedIds.includes(id);
    },
    [safeSelectedIds],
  );

  const addToSelectedIds = useCallback((id: number) => {
    setSelectedIds((prev) => [...prev, id]);
  }, []);

  const removeFromSelectedIds = useCallback((id: number) => {
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  }, []);

  const selectAllOnPage = useCallback(() => {
    setSelectedIds(displayFlashcards.map((flashcard) => flashcard.example.id));
  }, [displayFlashcards]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Student flashcards hook call for delete operations and ownership checks
  const { deleteFlashcards, isPendingFlashcard, flashcards } =
    useStudentFlashcards();

  // Some add or remove is pending
  const isSomethingPending = useMemo(() => {
    return (
      flashcards?.some((flashcard) =>
        isPendingFlashcard({ exampleId: flashcard.example.id }),
      ) ?? false
    );
  }, [flashcards, isPendingFlashcard]);

  const deleteFlashcard = useCallback(
    (id: number) => {
      return deleteFlashcards([id]);
    },
    [deleteFlashcards],
  );

  const deleteSelectedFlashcards = useCallback(() => {
    return deleteFlashcards(safeSelectedIds);
  }, [deleteFlashcards, safeSelectedIds]);

  const isRemovingFlashcard = useCallback(
    (id: number) => {
      return isPendingFlashcard({ exampleId: id });
    },
    [isPendingFlashcard],
  );

  // For more info view (does this belong here?)
  const { lessonPopup } = useLessonPopup();

  return {
    allFlashcards, // Returned only for the full-table writeToClipboard
    displayFlashcards,
    paginationState,
    onGoingToQuiz,
    error,
    selectedIds: safeSelectedIds,
    isSelected,
    addToSelectedIds,
    removeFromSelectedIds,
    selectAllOnPage,
    clearSelection,
    isSomethingPending,
    deleteFlashcard,
    deleteSelectedFlashcards,
    lessonPopup,
    isRemovingFlashcard,
  };
}
