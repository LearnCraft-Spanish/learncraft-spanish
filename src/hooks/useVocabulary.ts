import { useQuery } from '@tanstack/react-query'
import { useBackend } from './useBackend'
import { useUserData } from './useUserData'

export function useVocabulary() {
  const userDataQuery = useUserData()
  const { getVocabFromBackend } = useBackend()
  const hasAccess = (userDataQuery.data?.role === 'admin' || userDataQuery.data?.role === 'student')

  const officialQuizzesQuery = useQuery({
    queryKey: ['vocabulary'],
    queryFn: getVocabFromBackend,
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
    enabled: hasAccess,
  })
  return officialQuizzesQuery
}
