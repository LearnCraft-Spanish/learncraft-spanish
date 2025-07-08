import type { Flashcard } from '@LearnCraft-Spanish/shared';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthAdapter } from '../adapters/authAdapter';
import { useFlashcardAdapter } from '../adapters/flashcardAdapter';
import { queryDefaults } from '../utils/queryUtils';

export interface UseStudentFlashcardsReturnType {
  flashcards: Flashcard[] | undefined;
  isLoading: boolean;
  error: Error | null;
  isExampleCollected: (exampleId: number) => boolean;
}

export const useStudentFlashcards = (): UseStudentFlashcardsReturnType => {
  const { isAdmin, isCoach, isStudent } = useAuthAdapter();
  const { getMyFlashcards, getStudentFlashcards } = useFlashcardAdapter();
  const { appUser } = useActiveStudent();

  const userId = appUser?.recordId;

  const hasAccess = isAdmin || isCoach || isStudent;

  const getFlashcards = useCallback(async () => {
    if (isStudent) {
      return getMyFlashcards();
    } else if ((isAdmin || isCoach) && userId) {
      return getStudentFlashcards(userId);
    }
    console.error('No access to flashcards');
    return [];
  }, [
    isAdmin,
    isCoach,
    isStudent,
    getMyFlashcards,
    getStudentFlashcards,
    userId,
  ]);

  const {
    data: flashcards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['flashcards', userId],
    queryFn: () => getFlashcards(),
    enabled: hasAccess && appUser !== null,
    ...queryDefaults,
  });

  const isExampleCollected = useCallback(
    (exampleId: number) => {
      return (
        flashcards?.some((flashcard) => flashcard.example.id === exampleId) ??
        false
      );
    },
    [flashcards],
  );

  return { flashcards, isLoading, error, isExampleCollected };
};
