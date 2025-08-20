import type { Flashcard } from 'src/types/interfaceDefinitions';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useBackend } from 'src/hooks/useBackend';
import { useExampleUpdate } from './useExampleUpdate';

export function useVerifiedExamples() {
  const { isAdmin, isCoach, isStudent } = useAuthAdapter();
  const { updateExampleFromQuery } = useExampleUpdate();
  const { getVerifiedExamplesFromBackend } = useBackend();
  const hasAccess = isAdmin || isCoach || isStudent;

  const verifiedExamplesQuery = useQuery({
    queryKey: ['verifiedExamples'],
    queryFn: getVerifiedExamplesFromBackend,
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
    enabled: hasAccess,
  });

  const updateVerifiedExample = useCallback(
    (newExampleData: Flashcard) => {
      try {
        updateExampleFromQuery(newExampleData, verifiedExamplesQuery);
      } catch (error) {
        console.error('Error updating quiz example:', error);
      }
    },
    [updateExampleFromQuery, verifiedExamplesQuery],
  );

  return { verifiedExamplesQuery, updateVerifiedExample };
}
