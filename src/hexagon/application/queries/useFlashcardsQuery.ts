import type {
  ExampleWithVocabulary,
  Flashcard,
  UpdateFlashcardIntervalCommand,
} from '@learncraft-spanish/shared';

import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useFlashcardAdapter } from '@application/adapters/flashcardAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useTempId } from '@application/coordinators/hooks/useTempId';
import { queryDefaults } from '@application/utils/queryUtils';
import { toISODate, toISODateTime } from '@domain/functions/dateUtils';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

export interface UseFlashcardsQueryReturnType {
  flashcards: Flashcard[] | undefined;
  isLoading: boolean;
  error: Error | null;
  pendingDeleteExampleIds: number[] | undefined;
  createFlashcards: (examples: ExampleWithVocabulary[]) => Promise<Flashcard[]>;
  deleteFlashcards: (exampleIds: number[]) => Promise<number>;
  updateFlashcards: (
    updates: UpdateFlashcardIntervalCommand[],
  ) => Promise<Flashcard[]>;
  isFetchingFlashcards: boolean;
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

  const { getNextTempId } = useTempId();

  const { appUser, isOwnUser } = useActiveStudent();

  const userId = appUser?.recordId;
  const queryClient = useQueryClient();

  const hasAccess = isAdmin || isCoach || isStudent;

  // Pending deletes are registered by exampleId rather than flashcardId.
  const { data: pendingDeleteExampleIds } = useQuery({
    queryKey: ['flashcards', 'pendingDeletes', userId],
    queryFn: () =>
      queryClient.getQueryData<number[]>([
        'flashcards',
        'pendingDeletes',
        userId,
      ]) ?? [],
    ...queryDefaults.entityData,
  });

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
    isFetching: isFetchingFlashcards,
    error,
  } = useQuery({
    queryKey: ['flashcards', userId],
    queryFn: () => getFlashcards(),
    enabled: hasAccess && appUser !== null && userId !== undefined,
    ...queryDefaults.entityData,
  });

  const createTempFlashcards = useCallback(
    (examples: ExampleWithVocabulary[]) => {
      return examples.map((example) => ({
        example,
        id: getNextTempId(), // Negative id for temporary flashcards, decrements
        custom: false,
        dateCreated: toISODateTime(),
        userId: userId!, // In the enabled trait of the query, never undefined
        interval: 1, // Default interval, same as real flashcards
        lastReviewed: toISODate(),
        nextReview: toISODate(),
      }));
    },
    [getNextTempId, userId],
  );

  const createStudentFlashcardsMutation = useMutation({
    mutationFn: (examples: ExampleWithVocabulary[]) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Call backend to create flashcards
      const promise = createStudentFlashcards({
        studentId: userId,
        examples,
      });

      return promise;
    },

    onMutate: (examples: ExampleWithVocabulary[]) => {
      // Cancel any in-flight queries to prevent race conditions
      queryClient.cancelQueries({
        queryKey: ['flashcards', userId],
      });

      // Temporary flashcards for optimistic update, uses real example data
      const tempFlashcards: Flashcard[] = createTempFlashcards(examples);

      // Optimistically update the flashcards cache
      queryClient.setQueryData(
        ['flashcards', userId],
        (oldData: Flashcard[]) => {
          if (!oldData) return tempFlashcards;
          return [...oldData, ...tempFlashcards];
        },
      );

      // Return context for rollback
      return tempFlashcards;
    },

    onError: (error, _variables, context) => {
      // In the case of an error, first log the error
      console.error('Failed to create flashcards', error);
      // Toast the failure
      toast.error('Failed to create flashcards');
      if (!context) return;
      // Refer to the context (the temporary flashcards) for rollback
      const tempFlashcards = context;
      // Map the ids to remove
      const idsToRemove = tempFlashcards.map((flashcard) => flashcard.id);
      // Remove the flashcards with the mapped ids from the cache
      queryClient.setQueryData(['flashcards', userId], (oldData: Flashcard[]) =>
        oldData.filter((flashcard) => !idsToRemove.includes(flashcard.id)),
      );
    },
    onSuccess: (result, _variables, context) => {
      // Refer to the context (the temporary flashcards) for rollback
      const tempFlashcards = context;

      // Map the ids to remove
      const idsToRemove =
        tempFlashcards?.map((flashcard) => flashcard.id) ?? [];

      // Check the current state of the cache, fallback to empty array if undefined
      const oldData: Flashcard[] =
        queryClient.getQueryData(['flashcards', userId]) ?? [];

      // Remove the flashcards with the mapped ids from the cache
      const filteredData = oldData.filter(
        (flashcard) => !idsToRemove.includes(flashcard.id),
      );

      // concatenate the filtered data with the result
      const newData = [...filteredData, ...result];

      // Add the result to the cache
      queryClient.setQueryData(['flashcards', userId], () => newData);
    },
    onSettled: () => {
      // regardless of outcome, refetch both relevant queries.
      // Inside hexagon flashcard query (this query, ensures accurate data)
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      // Outside hexagon flashcard query
      queryClient.invalidateQueries({ queryKey: ['flashcardData'] });
    },
  });

  const createMyStudentFlashcardsMutation = useMutation({
    mutationFn: (examples: ExampleWithVocabulary[]) => {
      // Call backend to create flashcards
      const promise = createMyStudentFlashcards({ examples });
      return promise;
    },
    onMutate: (examples: ExampleWithVocabulary[]) => {
      // Cancel any in-flight queries to prevent race conditions
      queryClient.cancelQueries({
        queryKey: ['flashcards', userId],
      });

      // Temporary flashcards for optimistic update, uses real example data
      const tempFlashcards: Flashcard[] = createTempFlashcards(examples);

      // Optimistically update the flashcards cache
      queryClient.setQueryData(
        ['flashcards', userId],
        (oldData: Flashcard[]) => {
          if (!oldData) return tempFlashcards;
          return [...oldData, ...tempFlashcards];
        },
      );

      // Return context for rollback
      return tempFlashcards;
    },
    onError: (error, _variables, context) => {
      // In the case of an error, first log the error
      console.error('Failed to create flashcards', error);
      // Toast the failure
      toast.error('Failed to create flashcards');
      if (!context) return;
      // Refer to the context (the temporary flashcards) for rollback
      const tempFlashcards = context;
      // Map the ids to remove
      const idsToRemove = tempFlashcards.map((flashcard) => flashcard.id);
      // Remove the flashcards with the mapped ids from the cache
      queryClient.setQueryData(['flashcards', userId], (oldData: Flashcard[]) =>
        oldData.filter((flashcard) => !idsToRemove.includes(flashcard.id)),
      );
    },
    onSuccess: (result, _variables, context) => {
      // Refer to the context (the temporary flashcards) for rollback
      const tempFlashcards = context;
      // The new flashcards are returned from the backend
      const newFlashcards = result;

      // Map the ids to remove
      const idsToRemove =
        tempFlashcards?.map((flashcard) => flashcard.id) ?? [];

      // Check the current state of the cache, fallback to empty array if undefined
      const oldData: Flashcard[] =
        queryClient.getQueryData(['flashcards', userId]) ?? [];

      // Remove the temporary flashcards from the cache
      const oldFlashcards = oldData.filter(
        (flashcard) => !idsToRemove.includes(flashcard.id),
      );

      // concatenate the filtered data with the result
      const newData = [...oldFlashcards, ...newFlashcards];

      // Add the result to the cache
      queryClient.setQueryData(['flashcards', userId], () => newData);
    },
    onSettled: () => {
      // regardless of outcome, refetch both relevant queries.
      // Inside hexagon flashcard query (this query, ensures accurate data)
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      // Outside hexagon flashcard query
      queryClient.invalidateQueries({ queryKey: ['flashcardData'] });
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
    },
    onSettled: () => {
      // refetch inside hexagon flashcard query
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      // refetch outside hexagon flashcard query
      queryClient.invalidateQueries({ queryKey: ['flashcardData'] });
    },
  });

  const createFlashcards = useCallback(
    (examples: ExampleWithVocabulary[]) => {
      if (isOwnUser && appUser?.studentRole === 'student') {
        return createMyStudentFlashcardsMutation.mutateAsync(examples);
      } else if (
        (isAdmin || isCoach) &&
        appUser?.studentRole === 'student' &&
        userId
      ) {
        return createStudentFlashcardsMutation.mutateAsync(examples);
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
      return promise;
    },
    onMutate: (flashcardIds: number[]) => {
      queryClient.cancelQueries({
        queryKey: ['flashcards', userId],
      });
      if (!flashcards) {
        throw new Error('Flashcards not found');
      }
      const exampleIds = flashcardIds.map((flashcardId) => {
        const flashcard = flashcards.find(
          (flashcard) => flashcard.id === flashcardId,
        );
        if (!flashcard) {
          throw new Error('Flashcard not found');
        }
        return flashcard.example.id;
      });
      const deletedFlashcards = flashcards.filter((flashcard) =>
        flashcardIds.includes(flashcard.id),
      );
      queryClient.setQueryData(
        ['flashcards', 'pendingDeletes', userId],
        (oldData: number[]) => {
          if (!oldData) return exampleIds;
          return [...oldData, ...exampleIds];
        },
      );
      queryClient.setQueryData(
        ['flashcards', userId],
        (oldData: Flashcard[]) => {
          return oldData.filter(
            (flashcard) => !flashcardIds.includes(flashcard.id),
          );
        },
      );

      // Return the deleted flashcards for rollback
      return { exampleIds, deletedFlashcards };
    },
    onError: (error, _variables, context) => {
      // Log the error
      console.error('Failed to delete flashcards', error);
      // Toast the failure
      toast.error('Failed to delete flashcards');
      // Refer to the context (the deleted flashcards) for rollback
      if (!context) return;
      const { exampleIds, deletedFlashcards } = context;
      // Remove the exampleIds from the pending deletes
      queryClient.setQueryData(
        ['flashcards', 'pendingDeletes', userId],
        (oldData: number[]) =>
          oldData.filter((deletedId) => !exampleIds.includes(deletedId)),
      );
      // Add the flashcards back to the cache
      queryClient.setQueryData(
        ['flashcards', userId],
        (oldData: Flashcard[]) => {
          if (!oldData) return deletedFlashcards;
          return [...oldData, ...deletedFlashcards];
        },
      );
    },
    onSuccess: (result, variables, context) => {
      if (!context) return;
      const { exampleIds } = context;
      // check result (number of deletes) is same as flashcardIds.length
      if (result !== variables.length) {
        // Toast the failure
        toast.error(
          `Failed to delete some flashcards. ${result} of ${variables.length} flashcards deleted.`,
        );
        // We have no way to restore this state since we only get a number back from the backend.
        // Rely on invalidation alone, which onSettled will handle.
      }
      // Either way, remove the exampleIds from the pending deletes
      queryClient.setQueryData(
        ['flashcards', 'pendingDeletes', userId],
        (oldData: number[]) =>
          oldData.filter((deletedId) => !exampleIds.includes(deletedId)),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      queryClient.invalidateQueries({ queryKey: ['flashcardData'] });
    },
  });

  const deleteStudentFlashcardsMutation = useMutation({
    mutationFn: (flashcardIds: number[]) => {
      queryClient.setQueryData(
        ['flashcards', 'pendingDeletes', userId],
        (oldData: number[]) => {
          if (!oldData) return flashcardIds;
          return [...oldData, ...flashcardIds];
        },
      );
      const promise = deleteStudentFlashcards({ flashcardIds });
      return promise;
    },
    onMutate: (flashcardIds: number[]) => {
      queryClient.cancelQueries({
        queryKey: ['flashcards', userId],
      });
      if (!flashcards) {
        throw new Error('Flashcards not found');
      }
      const exampleIds = flashcardIds.map((flashcardId) => {
        const flashcard = flashcards.find(
          (flashcard) => flashcard.id === flashcardId,
        );
        if (!flashcard) {
          throw new Error('Flashcard not found');
        }
        return flashcard.example.id;
      });
      const deletedFlashcards = flashcards.filter((flashcard) =>
        exampleIds.includes(flashcard.example.id),
      );
      queryClient.setQueryData(
        ['flashcards', 'pendingDeletes', userId],
        (oldData: number[]) => {
          if (!oldData) return exampleIds;
          return [...oldData, ...exampleIds];
        },
      );
      queryClient.setQueryData(
        ['flashcards', userId],
        (oldData: Flashcard[]) => {
          return oldData.filter(
            (flashcard) => !flashcardIds.includes(flashcard.id),
          );
        },
      );

      // Return the deleted flashcards for rollback
      return { exampleIds, deletedFlashcards };
    },
    onError: (error, _variables, context) => {
      // Log the error
      console.error('Failed to delete flashcards', error);
      // Toast the failure
      toast.error('Failed to delete flashcards');
      // Refer to the context (the deleted flashcards) for rollback
      if (!context) return;
      const { exampleIds, deletedFlashcards } = context;
      // Remove the exampleIds from the pending deletes
      queryClient.setQueryData(
        ['flashcards', 'pendingDeletes', userId],
        (oldData: number[]) => oldData.filter((id) => !exampleIds.includes(id)),
      );
      // Add the flashcards back to the cache
      queryClient.setQueryData(
        ['flashcards', userId],
        (oldData: Flashcard[]) => {
          if (!oldData) return deletedFlashcards;
          return [...oldData, ...deletedFlashcards];
        },
      );
    },
    onSuccess: (result, variables, context) => {
      if (!context) return;
      const { exampleIds } = context;
      // check result (number of deletes) is same as flashcardIds.length
      if (result !== variables.length) {
        // Toast the failure
        toast.error(
          `Failed to delete some flashcards. ${result} of ${variables.length} flashcards deleted.`,
        );
        // We have no way to restore this state since we only get a number back from the backend.
        // Rely on invalidation alone, which onSettled will handle.
      }
      // Either way, remove the exampleIds from the pending deletes
      queryClient.setQueryData(
        ['flashcards', 'pendingDeletes', userId],
        (oldData: number[]) =>
          oldData.filter((deletedId) => !exampleIds.includes(deletedId)),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      queryClient.invalidateQueries({ queryKey: ['flashcardData'] });
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
    isFetchingFlashcards,
    error,
    pendingDeleteExampleIds,
    createFlashcards,
    deleteFlashcards,
    updateFlashcards,
  };
};
