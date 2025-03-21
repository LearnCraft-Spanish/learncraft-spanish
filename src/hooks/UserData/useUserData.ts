import { useQuery } from '@tanstack/react-query';
import useAuth from 'src/hooks/useAuth';
import { useBackend } from 'src/hooks/useBackend';

export function useUserData() {
  const { isAuthenticated } = useAuth();
  const { getUserDataFromBackend } = useBackend();

  const userDataQuery = useQuery({
    queryKey: ['userData'],
    queryFn: getUserDataFromBackend,
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
    enabled: isAuthenticated,
  });

  return userDataQuery;
}
