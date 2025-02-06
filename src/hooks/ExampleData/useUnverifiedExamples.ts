import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Flashcard, NewFlashcard } from 'src/types/interfaceDefinitions';
import { useBackend } from 'src/hooks/useBackend';
import { useUserData } from 'src/hooks/UserData/useUserData';
import { useExampleUpdate } from './useExampleUpdate';

export function useUnverifiedExamples() {
  const { updateExampleFromQuery } = useExampleUpdate();
  const userDataQuery = useUserData();
  const { getUnverifiedExamplesFromBackend, createUnverifiedExample } =
    useBackend();
  const hasAccess =
    userDataQuery.data?.roles.adminRole === 'coach' ||
    userDataQuery.data?.roles.adminRole === 'admin';

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
