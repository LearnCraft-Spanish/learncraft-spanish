import type { Flashcard } from '@learncraft-spanish/shared';
import type { PaginationState } from './Pagination/usePagination';
import type { LessonPopup } from './useLessonPopup';
import { useCallback, useState } from 'react';
import useLessonPopup from './useLessonPopup';
import { useStudentFlashcards } from './useStudentFlashcards';

export interface UseFlashcardTableProps {
  allFlashcards: Flashcard[];
  displayFlashcards: Flashcard[];
  paginationState: PaginationState;
  isLoading: boolean;
  error: Error | null;
}

export interface UseFlashcardTableReturn {
  allFlashcards: Flashcard[];
  displayFlashcards: Flashcard[];
  paginationState: PaginationState;
  isLoading: boolean;
  error: Error | null;
  selectedIds: number[];
  isSelected: (id: number) => boolean;
  addToSelectedIds: (id: number) => void;
  removeFromSelectedIds: (id: number) => void;
  selectAllOnPage: () => void;
  clearSelection: () => void;
  deleteSingleFlashcard: (id: number) => void;
  deleteSelectedFlashcards: () => void;
  deleteInProgress: boolean;
  lessonPopup: LessonPopup;
}

export function useFlashcardTable({
  allFlashcards,
  displayFlashcards,
  paginationState,
  isLoading,
  error,
}: UseFlashcardTableProps): UseFlashcardTableReturn {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const isSelected = useCallback(
    (id: number) => {
      return selectedIds.includes(id);
    },
    [selectedIds],
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
  const { deleteFlashcards } = useStudentFlashcards();

  // Single delete operation
  const deleteSingleFlashcard = useCallback(
    (id: number) => {
      deleteFlashcards([id]);
    },
    [deleteFlashcards],
  );

  // Bulk delete operation
  const deleteSelectedFlashcards = useCallback(() => {
    setDeleteInProgress(true);
    deleteFlashcards(selectedIds).then(() => {
      setDeleteInProgress(false);
    });
  }, [deleteFlashcards, selectedIds]);

  // For more info view (does this belong here?)
  const { lessonPopup } = useLessonPopup();

  return {
    allFlashcards, // Returned only for the full-table writeToClipboard
    displayFlashcards,
    paginationState,
    isLoading,
    error,
    selectedIds,
    isSelected,
    addToSelectedIds,
    removeFromSelectedIds,
    selectAllOnPage,
    clearSelection,
    deleteSingleFlashcard,
    deleteSelectedFlashcards,
    deleteInProgress,
    lessonPopup,
  };
}
