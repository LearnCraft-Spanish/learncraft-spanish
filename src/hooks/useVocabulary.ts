import { useQuery } from '@tanstack/react-query'
import { useBackend } from './useBackend'

export function useVocabulary() {
  const { getVocabFromBackend } = useBackend()
  const officialQuizzesQuery = useQuery({
    queryKey: ['vocabulary'],
    queryFn: getVocabFromBackend,
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
  })
  return officialQuizzesQuery
}
