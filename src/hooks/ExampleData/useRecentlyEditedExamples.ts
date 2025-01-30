import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Flashcard, NewFlashcard } from 'src/types/interfaceDefinitions';
import { useBackend } from 'src/hooks/useBackend';
import { useUserData } from 'src/hooks/UserData/useUserData';
import { useExampleUpdate } from './useExampleUpdate';

export function useRecentlyEditedExamples() {
  const { updateExampleFromQuery } = useExampleUpdate();
  const userDataQuery = useUserData();
  const { getRecentlyEditedExamples, createUnverifiedExample } = useBackend();
  const hasAccess =
    userDataQuery.data?.roles.adminRole === 'coach' ||
    userDataQuery.data?.roles.adminRole === 'admin';

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
