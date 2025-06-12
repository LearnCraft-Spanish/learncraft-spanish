import type {
  CreateNonVerbVocabulary,
  CreateVerbVocabulary,
  Vocabulary,
} from '@LearnCraft-Spanish/shared';
import { useVocabularyAdapter } from '@application/adapters/vocabularyAdapter';
import {
  normalizeQueryError,
  queryDefaults,
} from '@application/utils/queryUtils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface UseVocabularyResult {
  // Read operations
  vocabulary: Vocabulary[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  getById: (id: string) => Promise<Vocabulary | null>;

  // Write operations
  createVerb: (command: CreateVerbVocabulary) => Promise<number>;
  createNonVerb: (command: CreateNonVerbVocabulary) => Promise<number>;
  deleteVocabulary: (id: string) => Promise<void>;
  creating: boolean;
  creationError: Error | null;
  deleting: boolean;
  deletionError: Error | null;
}

/**
 * Hook to fetch and manage vocabulary.
 * This unit hook provides operations for all vocabulary types.
 */
export function useVocabulary(): UseVocabularyResult {
  // Get query client for cache invalidation
  const queryClient = useQueryClient();

  // Create adapter - infrastructure is composed internally
  const adapter = useVocabularyAdapter();

  // Query for fetching vocabulary
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vocabulary'],
    queryFn: () => adapter.getVocabulary(),
    ...queryDefaults.entityData,
  });

  // Mutations for vocabulary operations
  const verbMutation = useMutation({
    mutationFn: adapter.createVocabulary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });

  const nonVerbMutation = useMutation({
    mutationFn: adapter.createVocabulary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });

  const batchMutation = useMutation({
    mutationFn: adapter.createVocabulary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adapter.deleteVocabulary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });

  // Helper for getting a vocabulary item by ID
  const getById = async (id: string): Promise<Vocabulary | null> => {
    const idNumber = Number.parseInt(id);
    if (Number.isNaN(idNumber)) {
      throw new TypeError('Invalid vocabulary ID');
    }
    return adapter.getVocabularyById(idNumber);
  };

  // Create operations with type assertions
  const createVerb = async (command: CreateVerbVocabulary): Promise<number> => {
    const result = await verbMutation.mutateAsync(command);
    return result;
  };

  const createNonVerb = async (
    command: CreateNonVerbVocabulary,
  ): Promise<number> => {
    const result = await nonVerbMutation.mutateAsync(command);
    return result;
  };

  const deleteVocabulary = async (id: string): Promise<void> => {
    const idNumber = Number.parseInt(id);
    if (Number.isNaN(idNumber)) {
      throw new TypeError('Invalid vocabulary ID');
    }
    await deleteMutation.mutateAsync(idNumber);
  };

  // Combine errors from all mutations
  const creationError = normalizeQueryError(
    verbMutation.error || nonVerbMutation.error || batchMutation.error,
  );

  const deletionError = normalizeQueryError(deleteMutation.error);

  return {
    // Read operations
    vocabulary: data as Vocabulary[],
    loading: isLoading,
    error: normalizeQueryError(error),
    refetch,
    getById,

    // Write operations
    createVerb,
    createNonVerb,
    deleteVocabulary,
    creating:
      verbMutation.isPending ||
      nonVerbMutation.isPending ||
      batchMutation.isPending,
    deleting: deleteMutation.isPending,
    creationError,
    deletionError,
  };
}
