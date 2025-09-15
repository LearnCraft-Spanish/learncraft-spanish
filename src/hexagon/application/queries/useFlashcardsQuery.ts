import type {
  Flashcard,
  UpdateFlashcardIntervalCommand,
} from '@learncraft-spanish/shared';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useFlashcardAdapter } from '@application/adapters/flashcardAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';

import { queryDefaults } from '@application/utils/queryUtils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

export interface UseFlashcardsQueryReturnType {
  flashcards: Flashcard[] | undefined;
  isLoading: boolean;
  error: Error | null;
  createFlashcards: (exampleIds: number[]) => Promise<Flashcard[]>;
  deleteFlashcards: (exampleIds: number[]) => Promise<number>;
  updateFlashcards: (
    updates: UpdateFlashcardIntervalCommand[],
  ) => Promise<Flashcard[]>;
}

export const useFlashcardsQuery = (): UseFlashcardsQueryReturnType => {
  const { isAdmin, isCoach, isStudent } = useAuthAdapter();
  const {
    updateMyStudentFlashcards,
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

  const pendingDeletes = useMemo(
    () =>
      queryClient.getQueryData<number[]>([
        'flashcards',
        'pendingDeletes',
        userId,
      ]),
    [queryClient, userId],
  );

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
    ...queryDefaults.entityData,
  });

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
      queryClient.invalidateQueries({ queryKey: ['flashcardData'] }); // refetch outside hexagon flashcard query
    },
  });

  const createMyStudentFlashcardsMutation = useMutation({
    mutationFn: (exampleIds: number[]) => {
      const promise = createMyStudentFlashcards({ exampleIds });
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
      queryClient.invalidateQueries({ queryKey: ['flashcardData'] }); // refetch outside hexagon flashcard query
    },
  });

  const updateMyStudentFlashcardsMutation = useMutation({
    mutationFn: (updates: UpdateFlashcardIntervalCommand[]) => {
      const promise = updateMyStudentFlashcards({ updates });
      // toast.promise(promise, {
      //   pending: 'Updating flashcards...',
      //   success: 'Flashcards updated',
      //   error: 'Failed to update flashcards',
      // });
      return promise;
    },
    onSuccess: (result, _variables, _context) => {
      queryClient.setQueryData(
        ['flashcards', userId],
        (oldData: Flashcard[]) => {
          if (!oldData) return result;
          // Update the flashcards with the returned updated flashcards
          const updatedMap = new Map(result.map((fc) => [fc.id, fc]));
          return oldData.map((fc) => updatedMap.get(fc.id) || fc);
        },
      );
      queryClient.invalidateQueries({ queryKey: ['flashcardData'] }); // refetch outside hexagon flashcard query
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
      return Promise.reject(new Error('No access to create flashcards'));
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
    mutationFn: (flashcardIds: number[]) => {
      const promise = deleteMyStudentFlashcards({ flashcardIds });
      toast.promise(promise, {
        pending: 'Deleting flashcards...',
        success: 'Flashcards deleted',
        error: 'Failed to delete flashcards',
      });
      return promise;
    },
    onSuccess: (result, _variables, _context) => {
      // check result (number of deletes) is same as flashcardIds.length
      if (result !== _variables.length) {
        queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
        toast.error(
          `Failed to delete flashcards. ${result} of ${_variables.length} flashcards deleted.`,
        );
        return false;
      } else {
        queryClient.setQueryData(
          ['flashcards', userId],
          (oldData: Flashcard[]) =>
            oldData.filter((flashcard) => !_variables.includes(flashcard.id)),
        );
      }
      queryClient.invalidateQueries({ queryKey: ['flashcardData'] }); // refetch outside hexagon flashcard query
    },
    onError: (error, _variables, _context) => {
      console.error('Failed to delete flashcards', error);
    },
  });

  const deleteStudentFlashcardsMutation = useMutation({
    mutationFn: (flashcardIds: number[]) => {
      queryClient.setQueryData(
        ['flashcards', 'pendingDeletes', userId],
        (oldData: number[]) => [...oldData, ...flashcardIds],
      );
      const promise = deleteStudentFlashcards({ flashcardIds });
      toast.promise(promise, {
        pending: 'Deleting flashcards...',
        success: 'Flashcards deleted',
        error: 'Failed to delete flashcards',
      });
      return promise;
    },
    onSuccess: (result, _variables, _context) => {
      // check result (number of deletes) is same as flashcardIds.length
      if (result !== _variables.length) {
        queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
        toast.error(
          `Failed to delete flashcards. ${result} of ${_variables.length} flashcards deleted.`,
        );
      } else {
        queryClient.setQueryData(
          ['flashcards', userId],
          (oldData: Flashcard[]) =>
            oldData.filter((flashcard) => !_variables.includes(flashcard.id)),
        );
      }
      queryClient.invalidateQueries({ queryKey: ['flashcardData'] }); // refetch outside hexagon flashcard query
    },
    onError: (error, _variables, _context) => {
      console.error('Failed to delete flashcards', error);
    },
  });

  const deleteFlashcards = useCallback(
    async (exampleIds: number[]) => {
      // find flashcardIds from exampleIds
      const flashcardIds = flashcards
        ?.filter((flashcard) => exampleIds.includes(flashcard.example.id))
        .map((flashcard) => flashcard.id);
      if (!flashcardIds) {
        throw new Error('Student example IDs not found');
      }
      if (isOwnUser && appUser?.studentRole === 'student') {
        return await deleteMyStudentFlashcardsMutation.mutateAsync(
          flashcardIds,
        );
      } else if (
        (isAdmin || isCoach) &&
        appUser?.studentRole === 'student' &&
        userId
      ) {
        return await deleteStudentFlashcardsMutation.mutateAsync(flashcardIds);
      } else {
        console.error('No access to delete flashcards');
        return Promise.reject(new Error('No access to delete flashcards'));
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
      flashcards,
    ],
  );

  const updateFlashcards = useCallback(
    (updates: UpdateFlashcardIntervalCommand[]) => {
      if (isOwnUser && appUser?.studentRole === 'student') {
        return updateMyStudentFlashcardsMutation.mutateAsync(updates);
      }
      console.error('No access to update flashcards');
      return Promise.reject(new Error('No access to update flashcards'));
    },
    [updateMyStudentFlashcardsMutation, isOwnUser, appUser?.studentRole],
  );

  return {
    flashcards,
    isLoading,
    error,
    createFlashcards,
    deleteFlashcards,
    updateFlashcards,
  };
};
