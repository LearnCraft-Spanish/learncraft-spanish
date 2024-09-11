import { useQuery } from '@tanstack/react-query'
import { useBackend } from './useBackend'

export function useVerifiedExamples() {
  const { getVerifiedExamplesFromBackend } = useBackend()
  const verifiedExamplesQuery = useQuery({
    queryKey: ['verifiedExamples'],
    queryFn: getVerifiedExamplesFromBackend,
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
  })
  return verifiedExamplesQuery
}
