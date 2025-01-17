import { useQuery } from '@tanstack/react-query';
import { useBackend } from 'src/hooks/useBackend';
import { useUserData } from 'src/hooks/UserData/useUserData';

export function useVerifiedExamples() {
  const userDataQuery = useUserData();
  const { getVerifiedExamplesFromBackend } = useBackend();
  const hasAccess =
    userDataQuery.data?.isAdmin || userDataQuery.data?.role === 'student';

  const verifiedExamplesQuery = useQuery({
    queryKey: ['verifiedExamples'],
    queryFn: getVerifiedExamplesFromBackend,
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
    enabled: hasAccess,
  });

  return verifiedExamplesQuery;
}
