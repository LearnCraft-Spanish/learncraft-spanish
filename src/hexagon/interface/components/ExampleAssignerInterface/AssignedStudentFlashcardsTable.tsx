import type { Flashcard } from '@learncraft-spanish/shared';
import { FlashcardTable } from '@interface/components/Tables';

interface AssignedStudentFlashcardsTableProps {
  allFlashcards: Flashcard[];
  displayFlashcards: Flashcard[];
  paginationState: {
    totalItems: number;
    pageNumber: number;
    maxPageNumber: number;
    startIndex: number;
    endIndex: number;
    pageSize: number;
    isOnFirstPage: boolean;
    isOnLastPage: boolean;
    previousPage: () => void;
    nextPage: () => void;
    goToFirstPage: () => void;
  };
  isLoading: boolean;
  error: Error | null;
  targetName: string;
  onGoingToQuiz: () => void;
}

export function AssignedStudentFlashcardsTable({
  allFlashcards,
  displayFlashcards,
  paginationState,
  isLoading,
  error,
  targetName,
  onGoingToQuiz,
}: AssignedStudentFlashcardsTableProps) {
  // Show loading state even when no flashcards yet (to provide real-time feedback)
  if (isLoading && displayFlashcards.length === 0) {
    return (
      <>
        <h4>Examples Already Assigned to {targetName}</h4>
        <div>Loading assigned flashcards...</div>
      </>
    );
  }

  // Don't show table if no flashcards and not loading
  if (displayFlashcards.length === 0 && !isLoading) {
    return null;
  }

  return (
    <>
      <h4>
        Examples Already Assigned to {targetName} ({allFlashcards.length})
      </h4>
      {error && (
        <div className="error">
          Error loading assigned flashcards: {error.message}
        </div>
      )}
      <FlashcardTable
        allFlashcards={allFlashcards}
        displayFlashcards={displayFlashcards}
        paginationState={paginationState}
        onGoingToQuiz={onGoingToQuiz}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
