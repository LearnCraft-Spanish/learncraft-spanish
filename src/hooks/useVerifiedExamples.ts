import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { labelCollectedExamples } from '../functions/labelCollectedExamples'
import { useBackend } from './useBackend'
import { useStudentFlashcards } from './useStudentFlashcards'

export function useVerifiedExamples() {
  const { getVerifiedExamplesFromBackend } = useBackend()
  const { flashcardDataQuery } = useStudentFlashcards()
  const queryClient = useQueryClient()

  const verifiedExamplesQuery = useQuery({
    queryKey: ['verifiedExamples'],
    queryFn: getVerifiedExamplesFromBackend,
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
  })

  useEffect(() => {
    if (verifiedExamplesQuery.data && flashcardDataQuery.data?.studentExamples) {
      console.log('check for infinite loop')
      const verifiedExamples = verifiedExamplesQuery.data
      const studentExamples = flashcardDataQuery.data?.studentExamples
      const taggedExamples = labelCollectedExamples(verifiedExamples, studentExamples)
      queryClient.setQueryData(['verifiedExamples'], taggedExamples)
    }
  }, [verifiedExamplesQuery.data, flashcardDataQuery.data?.studentExamples, queryClient])

  return verifiedExamplesQuery
}
