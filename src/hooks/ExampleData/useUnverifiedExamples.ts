import type { Flashcard, NewFlashcard } from 'src/types/interfaceDefinitions';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useBackend } from 'src/hooks/useBackend';
import { useExampleUpdate } from './useExampleUpdate';

export function useUnverifiedExamples() {
  const { updateExampleFromQuery } = useExampleUpdate();
  const { isAdmin, isCoach } = useAuthAdapter();
  const { getUnverifiedExamplesFromBackend, createUnverifiedExample } =
    useBackend();
  const hasAccess = isAdmin || isCoach;

  const unverifiedExamplesQuery = useQuery({
    queryKey: ['unverifiedExamples'],
    queryFn: getUnverifiedExamplesFromBackend,
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
    enabled: hasAccess,
  });

  const addUnverifiedExample = async (example: NewFlashcard) => {
    if (hasAccess) {
      await createUnverifiedExample(example);
      await unverifiedExamplesQuery.refetch();
    }
    await unverifiedExamplesQuery.refetch();
  };

  const updateUnverifiedExample = useCallback(
    (newExampleData: Flashcard) => {
      try {
        updateExampleFromQuery(newExampleData, unverifiedExamplesQuery);
      } catch (error) {
        console.error('Error updating quiz example:', error);
      }
    },
    [updateExampleFromQuery, unverifiedExamplesQuery],
  );

  return {
    unverifiedExamplesQuery,
    addUnverifiedExample,
    updateUnverifiedExample,
  };
}
