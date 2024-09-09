import { useQuery } from '@tanstack/react-query'
import { useBackend } from './useBackend'

export function useUserData() {
  const { getUserDataFromBackend } = useBackend()
  const userDataQuery = useQuery({
    queryKey: ['userData'],
    queryFn: getUserDataFromBackend,
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
  })
  return userDataQuery
}
