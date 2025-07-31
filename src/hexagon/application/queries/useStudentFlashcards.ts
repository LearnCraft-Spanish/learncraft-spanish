import type { Flashcard } from '@learncraft-spanish/shared';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  createFlashcards: (exampleIds: number[]) => Promise<Flashcard[]>;
  deleteFlashcards: (exampleIds: number[]) => Promise<number>;
}

export const useStudentFlashcards = (): UseStudentFlashcardsReturnType => {
  const { isAdmin, isCoach, isStudent } = useAuthAdapter();
  const {
    getMyFlashcards,
    getStudentFlashcards,
    createMyStudentFlashcards,
    createStudentFlashcards,
    deleteMyStudentFlashcards,
    deleteStudentFlashcards,
  } = useFlashcardAdapter();
  const { appUser, isOwnUser } = useActiveStudent();

  const userId = appUser?.recordId;
  const queryClient = useQueryClient();

  const hasAccess = isAdmin || isCoach || isStudent;

  const getFlashcards = useCallback(async () => {
    if (isOwnUser && appUser?.studentRole === 'student') {
      return getMyFlashcards();
    } else if (
      (isAdmin || isCoach) &&
      appUser?.studentRole === 'student' &&
      userId
    ) {
      return getStudentFlashcards(userId);
    }
    console.error('No access to flashcards');
    return [];
  }, [
    isAdmin,
    isCoach,
    isOwnUser,
    appUser,
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

  const createStudentFlashcardsMutation = useMutation({
    mutationFn: (exampleIds: number[]) => {
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
      return promise;
    },
    onSuccess: (result, _variables, _context) => {
      queryClient.setQueryData(
        ['flashcards', userId],
        (oldData: Flashcard[]) => [...oldData, ...result],
      );
    },
  });

  const createMyStudentFlashcardsMutation = useMutation({
    mutationFn: (exampleIds: number[]) => {
      const promise = createMyStudentFlashcards(exampleIds);
      toast.promise(promise, {
        pending: 'Creating flashcards...',
        success: 'Flashcards created',
        error: 'Failed to create flashcards',
      });
      return promise;
    },
    onSuccess: (result, _variables, _context) => {
      queryClient.setQueryData(
        ['flashcards', userId],
        (oldData: Flashcard[]) => [...oldData, ...result],
      );
    },
  });

  const createFlashcards = useCallback(
    (exampleIds: number[]) => {
      if (isOwnUser && appUser?.studentRole === 'student') {
        return createMyStudentFlashcardsMutation.mutateAsync(exampleIds);
      } else if (
        (isAdmin || isCoach) &&
        appUser?.studentRole === 'student' &&
        userId
      ) {
        return createStudentFlashcardsMutation.mutateAsync(exampleIds);
      }
      console.error('No access to create flashcards');
      return Promise.resolve([]);
    },
    [
      createStudentFlashcardsMutation,
      createMyStudentFlashcardsMutation,
      isOwnUser,
      appUser?.studentRole,
      userId,
      isAdmin,
      isCoach,
    ],
  );

  const deleteMyStudentFlashcardsMutation = useMutation({
    mutationFn: (studentExampleIds: number[]) => {
      const promise = deleteMyStudentFlashcards({ studentExampleIds });
      toast.promise(promise, {
        pending: 'Deleting flashcards...',
        success: 'Flashcards deleted',
        error: 'Failed to delete flashcards',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
    },
  });

  const deleteStudentFlashcardsMutation = useMutation({
    mutationFn: (studentExampleIds: number[]) => {
      const promise = deleteStudentFlashcards({ studentExampleIds });
      toast.promise(promise, {
        pending: 'Deleting flashcards...',
        success: 'Flashcards deleted',
        error: 'Failed to delete flashcards',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
    },
  });

  const deleteFlashcards = useCallback(
    async (exampleIds: number[]) => {
      // find studentExampleIds from exampleIds
      const studentExampleIds = flashcards
        ?.filter((flashcard) => exampleIds.includes(flashcard.example.id))
        .map((flashcard) => flashcard.id);
      if (!studentExampleIds) {
        throw new Error('Student example IDs not found');
      }
      if (isOwnUser && appUser?.studentRole === 'student') {
        return await deleteMyStudentFlashcardsMutation.mutateAsync(
          studentExampleIds,
        );
      } else if (
        (isAdmin || isCoach) &&
        appUser?.studentRole === 'student' &&
        userId
      ) {
        return await deleteStudentFlashcardsMutation.mutateAsync(
          studentExampleIds,
        );
      } else {
        console.error('No access to delete flashcards');
        return Promise.resolve(0);
      }
    },
    [
      deleteMyStudentFlashcardsMutation,
      deleteStudentFlashcardsMutation,
      isOwnUser,
      appUser?.studentRole,
      userId,
      isAdmin,
      isCoach,
    ],
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
