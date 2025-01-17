import { useQuery } from '@tanstack/react-query';
import type { NewFlashcard } from 'src/types/interfaceDefinitions';
import { useBackend } from 'src/hooks/useBackend';
import { useUserData } from 'src/hooks/UserData/useUserData';

export function useUnverifiedExamples() {
  const userDataQuery = useUserData();
  const { getUnverifiedExamplesFromBackend, createUnverifiedExample } =
    useBackend();
  const hasAccess = userDataQuery.data?.isAdmin;

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

  return { unverifiedExamplesQuery, addUnverifiedExample };
}
