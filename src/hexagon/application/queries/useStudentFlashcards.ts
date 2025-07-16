import type { Flashcard } from '@LearnCraft-Spanish/shared';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuthAdapter } from '../adapters/authAdapter';
import { useFlashcardAdapter } from '../adapters/flashcardAdapter';
import { queryDefaults } from '../utils/queryUtils';

export interface UseStudentFlashcardsReturnType {
  flashcards: Flashcard[] | undefined;
  isLoading: boolean;
  error: Error | null;
  isExampleCollected: (exampleId: number) => boolean;
  createFlashcards: (exampleIds: number[]) => Promise<number>;
  deleteFlashcards: (studentExampleIds: number[]) => Promise<number>;
}

export const useStudentFlashcards = (): UseStudentFlashcardsReturnType => {
  const { isAdmin, isCoach, isStudent } = useAuthAdapter();
  const {
    getMyFlashcards,
    getStudentFlashcards,
    createStudentFlashcards,
    deleteStudentFlashcards,
  } = useFlashcardAdapter();
  const { appUser } = useActiveStudent();

  const userId = appUser?.recordId;
  const queryClient = useQueryClient();

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

  const createFlashcards = useCallback(
    async (exampleIds: number[]) => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const promise = createStudentFlashcards({
        studentId: userId,
        exampleIds,
      });
      toast.promise(promise, {
        pending: 'Creating flashcards...',
        success: 'Flashcards created',
        error: 'Failed to create flashcards',
      });

      promise.then(() => {
        queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      });

      return promise;
    },
    [createStudentFlashcards, userId, queryClient],
  );

  const deleteFlashcards = useCallback(
    async (studentExampleIds: number[]) => {
      const promise = deleteStudentFlashcards({ studentExampleIds });
      toast.promise(promise, {
        pending: 'Deleting flashcards...',
        success: 'Flashcards deleted',
        error: 'Failed to delete flashcards',
      });

      promise.then(() => {
        queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      });

      return promise;
    },
    [deleteStudentFlashcards, queryClient, userId],
  );

  return {
    flashcards,
    isLoading,
    error,
    isExampleCollected,
    createFlashcards,
    deleteFlashcards,
  };
};
