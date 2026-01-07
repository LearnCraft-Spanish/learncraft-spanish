// used in 1 context
import type { Flashcard, NewFlashcard } from 'src/types/interfaceDefinitions';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useBackend } from 'src/hooks/useBackend';
import { useExampleUpdate } from './useExampleUpdate';

export function useRecentlyEditedExamples() {
  const { updateExampleFromQuery } = useExampleUpdate();
  const { isAdmin, isCoach } = useAuthAdapter();
  const { getRecentlyEditedExamples, createUnverifiedExample } = useBackend();
  const hasAccess = isAdmin || isCoach;

  const recentlyEditedExamplesQuery = useQuery({
    queryKey: ['recentlyEditedExamples'],
    queryFn: getRecentlyEditedExamples,
    staleTime: 15000,
    gcTime: Infinity,
    enabled: hasAccess,
  });

  const addUnverifiedExample = async (example: NewFlashcard) => {
    if (hasAccess) {
      await createUnverifiedExample(example);
    }
    await recentlyEditedExamplesQuery.refetch();
  };

  const updateRecentlyEditedExample = useCallback(
    (newExampleData: Flashcard) => {
      try {
        updateExampleFromQuery(newExampleData, recentlyEditedExamplesQuery);
      } catch (error) {
        console.error('Error updating quiz example:', error);
      }
    },
    [updateExampleFromQuery, recentlyEditedExamplesQuery],
  );

  return {
    recentlyEditedExamplesQuery,
    addUnverifiedExample,
    updateRecentlyEditedExample,
  };
}
