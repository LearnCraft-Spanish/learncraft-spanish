import type {
  CreateNonVerbVocabulary,
  CreateVerb,
  Vocabulary,
} from '@LearnCraft-Spanish/shared';
import type { VocabularyQueryOptions } from '../ports/vocabularyPort';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useVocabularyAdapter } from '../adapters/vocabularyAdapter';
import { normalizeQueryError, queryDefaults } from '../utils/queryUtils';

interface UseVocabularyResult {
  // Read operations
  vocabulary: Vocabulary[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  getById: (id: string) => Promise<Vocabulary | null>;
  search: (query: string) => Promise<Vocabulary[]>;

  // Write operations
  createVerb: (command: CreateVerb) => Promise<Vocabulary>;
  createNonVerb: (command: CreateNonVerbVocabulary) => Promise<Vocabulary>;
  createBatch: (commands: CreateNonVerbVocabulary[]) => Promise<Vocabulary[]>;
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
export function useVocabulary(
  options?: VocabularyQueryOptions,
): UseVocabularyResult {
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
    queryKey: ['vocabulary', options],
    queryFn: () => adapter.getVocabulary(options),
    ...queryDefaults.entityData,
  });

  // Mutations for vocabulary operations
  const verbMutation = useMutation({
    mutationFn: adapter.createVerb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });

  const nonVerbMutation = useMutation({
    mutationFn: adapter.createNonVerbVocabulary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });

  const batchMutation = useMutation({
    mutationFn: adapter.createVocabularyBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adapter.deleteVocabulary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });

  // Helper for getting a vocabulary item by ID
  const getById = async (id: string): Promise<Vocabulary | null> => {
    return adapter.getVocabularyById(id);
  };

  // Helper for searching vocabulary
  const search = async (query: string): Promise<Vocabulary[]> => {
    return adapter.searchVocabulary(query);
  };

  // Create operations with type assertions
  const createVerb = async (command: CreateVerb): Promise<Vocabulary> => {
    const result = await verbMutation.mutateAsync(command);
    return result as Vocabulary;
  };

  const createNonVerb = async (
    command: CreateNonVerbVocabulary,
  ): Promise<Vocabulary> => {
    const result = await nonVerbMutation.mutateAsync(command);
    return result as Vocabulary;
  };

  const createBatch = async (
    commands: CreateNonVerbVocabulary[],
  ): Promise<Vocabulary[]> => {
    const results = await batchMutation.mutateAsync(commands);
    return results as Vocabulary[];
  };

  const deleteVocabulary = async (id: string): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  };

  // Combine errors from all mutations
  const creationError = normalizeQueryError(
    verbMutation.error || nonVerbMutation.error || batchMutation.error,
  );

  const deletionError = normalizeQueryError(deleteMutation.error);

  return {
    // Read operations
    vocabulary: data,
    loading: isLoading,
    error: normalizeQueryError(error),
    refetch,
    getById,
    search,

    // Write operations
    createVerb,
    createNonVerb,
    createBatch,
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
