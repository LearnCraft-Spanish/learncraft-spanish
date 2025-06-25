import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useFlashcardAdapter } from '../adapters/flashcardAdapter';
import { useActiveStudent } from '../coordinators/hooks/useActiveStudent';
export function useStudentFlashcards(studentId: number | undefined) {
  const { appUser, isOwnUser } = useActiveStudent();
  const adapter = useFlashcardAdapter();

  const getFlashcards = useCallback(() => {
    if (isOwnUser) {
      return adapter.getMyFlashcards();
    }
    return adapter.getStudentFlashcards(studentId!);
  }, [studentId, adapter, isOwnUser]);

  const {
    data: flashcards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['studentFlashcards', studentId],
    queryFn: getFlashcards,
    enabled: !!appUser,
  });

  // This lets us know if a flashcard is collected or not
  // helpful when comparing against a list of examples (flashcard manager/finder)
  const collectedFlashcardsIds = useMemo(() => {
    return flashcards?.map((flashcard) => flashcard.id);
  }, [flashcards]);

  const isFlashcardCollected = useCallback(
    (flashcardId: number) => {
      return collectedFlashcardsIds?.includes(flashcardId);
    },
    [collectedFlashcardsIds],
  );

  return { flashcards, isLoading, error, isFlashcardCollected };
}
