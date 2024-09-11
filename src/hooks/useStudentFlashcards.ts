import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import { debounce } from 'lodash'
import type { Flashcard, StudentExample, StudentFlashcardData } from '../interfaceDefinitions'
import { useUserData } from './useUserData'
import { useActiveStudent } from './useActiveStudent'
import { useBackend } from './useBackend'

export function useStudentFlashcards() {
  const queryClient = useQueryClient()
  const userDataQuery = useUserData()
  const { activeStudent } = useActiveStudent()
  const {
    getMyExamplesFromBackend,
    getActiveExamplesFromBackend,
    createStudentExample,
    createMyStudentExample,
    deleteStudentExample,
    deleteMyStudentExample,
    updateStudentExample,
    updateMyStudentExample,
  } = useBackend()

  const tempIdNum = useRef(-1)

  const activeStudentId = activeStudent?.recordId

  const studentFlashcardDependenciesLoaded = !!activeStudentId && userDataQuery.isSuccess

  const matchAndTrimArrays = useCallback((flashcardData: StudentFlashcardData) => {
    const exampleArray = flashcardData.examples
    const studentExampleArray = flashcardData.studentExamples
    const sortedExamples = exampleArray.sort((a, b) => a.recordId - b.recordId)
    const sortedStudentExamples = studentExampleArray.sort((a, b) => a.relatedExample - b.relatedExample)
    const filteredExamples = sortedExamples.filter((example) => {
      const match = studentExampleArray.find(studentExample => studentExample.relatedExample === example.recordId)
      return match
    })
    const filteredStudentExamples = sortedStudentExamples.filter((studentExample) => {
      const match = exampleArray.find(example => example.recordId === studentExample.relatedExample)
      return match
    })
    if (filteredExamples.length === filteredStudentExamples.length) {
      return { examples: filteredExamples, studentExamples: filteredStudentExamples }
    }
    return null
  }, [])

  const getFlashcardData = async () => {
    if (userDataQuery.data?.isAdmin && activeStudentId) {
      const backendResponse = await getActiveExamplesFromBackend(activeStudentId)
      if (backendResponse) {
        return matchAndTrimArrays(backendResponse)
      }
      throw new Error('bad response')
    }
    else if (userDataQuery.data?.role === 'student' || userDataQuery.data?.role === 'limited') {
      const backendResponse = await getMyExamplesFromBackend()
      if (backendResponse) {
        return matchAndTrimArrays(backendResponse)
      }
      throw new Error('bad response')
    }
    throw new Error('no active student')
  }

  const flashcardDataQuery = useQuery({
    queryKey: ['flashcardData', activeStudentId],
    queryFn: getFlashcardData,
    staleTime: Infinity, // Never stale unless manually updated
    enabled: studentFlashcardDependenciesLoaded,
  })

  // Debounce the refetch to wait until the last mutation is done
  const debouncedRefetch = useCallback(() => debounce(() => {
    queryClient.invalidateQueries({ queryKey: ['flashcardData', activeStudentId] })
  }, 500), [queryClient, activeStudentId]) // 500ms delay

  // Function to return promise that will either give success data or throw an error.
  const addToActiveStudentFlashcards = useCallback(async (flashcard: Flashcard) => {
    const recordId = flashcard.recordId
    let addPromise
    if (userDataQuery.data?.isAdmin && activeStudentId) {
      addPromise = createStudentExample(activeStudentId, recordId)
    }
    else if (userDataQuery.data?.role === 'student') {
      addPromise = createMyStudentExample(recordId)
    }
    if (!addPromise) {
      throw new Error('No active student')
    }
    const addResponse = addPromise
      .then((result: number | undefined) => {
        if (result !== 1) {
          throw new Error('Failed to add Flashcard')
        }
        return result
      })
    return addResponse
  }, [userDataQuery.data?.isAdmin, userDataQuery.data?.role, activeStudentId, createStudentExample, createMyStudentExample])

  const addFlashcardMutation = useMutation({
    mutationFn: (flashcard: Flashcard) => addToActiveStudentFlashcards(flashcard),
    onMutate: async (flashcard: Flashcard) => {
      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['flashcardData', activeStudentId] })

      // Memoize ID number for rollback
      const thisIdNum = tempIdNum.current

      // Decrement the tempIdNum for the next flashcard
      tempIdNum.current--

      // Make placeholder record for student-example until backend responds
      const today = new Date()
      const formattedToday = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
      const formattedTomorrow = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate() + 1}`

      // This needs checking. Types and date formats probably inaccurate.
      const newStudentExample: StudentExample = {
        studentEmailAddress: userDataQuery.data?.emailAddress || '',
        recordId: thisIdNum,
        relatedExample: flashcard.recordId,
        relatedStudent: activeStudentId!,
        dateCreated: formattedToday,
        lastReviewedDate: formattedToday,
        nextReviewDate: formattedTomorrow,
        reviewInterval: 1,
      }

      // Optimistically update the flashcards cache
      queryClient.setQueryData(['flashcardData', activeStudentId], (oldFlashcards: StudentFlashcardData) => {
        const oldFlashcardsCopy = [...oldFlashcards.examples]
        const oldStudentFlashcardsCopy = [...oldFlashcards.studentExamples]
        const newExampleArray = [...oldFlashcardsCopy, flashcard]
        const newStudentExampleArray = [...oldStudentFlashcardsCopy, newStudentExample]
        const newFlashcardData = { examples: newExampleArray, studentExamples: newStudentExampleArray }
        const trimmedNewFlashcardData = matchAndTrimArrays(newFlashcardData)
        return trimmedNewFlashcardData
      })
      return thisIdNum
    },
    onError: (error, _variables, context) => {
      console.error(error)
      // Roll back the cache for just the affected flashcard
      // Use the memoized ID number to rollback the cache
      const thisIdNum = context
      queryClient.setQueryData(['flashcardData', activeStudentId], (oldFlashcards: StudentFlashcardData) => {
        const oldFlashcardsCopy = [...oldFlashcards.examples]
        const oldStudentFlashcardsCopy = [...oldFlashcards.studentExamples]
        const newStudentExampleArray = oldStudentFlashcardsCopy.filter(studentExample => studentExample.recordId !== thisIdNum)
        const newFlashcardData = { examples: oldFlashcardsCopy, studentExamples: newStudentExampleArray }
        const trimmedNewFlashcardData = matchAndTrimArrays(newFlashcardData)
        return trimmedNewFlashcardData
      })
    },
    // Always refetch after success or error:
    onSettled: debouncedRefetch,
  })

  // Function to return promise that will either give success data or throw an error.
  const removeFromActiveStudentFlashcards = useCallback(async (studentFlashcardId: number) => {
    let removePromise
    if (userDataQuery.data?.isAdmin && activeStudentId) {
      removePromise = deleteStudentExample(studentFlashcardId)
    }
    else if (userDataQuery.data?.role === 'student') {
      removePromise = deleteMyStudentExample(studentFlashcardId)
    }
    if (!removePromise) {
      throw new Error('No active student')
    }
    const removeResponse = removePromise
      .then((result: number | undefined) => {
        if (result !== 1) {
          throw new Error('Failed to remove Flashcard')
        }
        return result
      })
    return removeResponse
  }, [userDataQuery.data?.isAdmin, userDataQuery.data?.role, activeStudentId, deleteStudentExample, deleteMyStudentExample])

  const removeFlashcardMutation = useMutation({
    mutationFn: (studentFlashcardId: number) => removeFromActiveStudentFlashcards(studentFlashcardId),
    onMutate: async (studentFlashcardId: number) => {
      // Cancel any in-flight queries
      await queryClient.cancelQueries({ queryKey: ['flashcardData', activeStudentId] })

      // Memoize the studentFlashcard and flashcard objects for rollback
      let studentFlashcardObject: StudentExample | undefined
      let flashcardObject: Flashcard | undefined

      // Optimistically update the flashcards cache
      queryClient.setQueryData(['flashcardData', activeStudentId], (oldFlashcards: StudentFlashcardData) => {
        // Find the studentFlashcard and related flashcard objects
        const studentFlashcardObjectOriginal = oldFlashcards.studentExamples.find(studentFlashcard => studentFlashcard.recordId === studentFlashcardId)
        const flashcardObjectOriginal = oldFlashcards.examples.find(flashcard => flashcard.recordId === studentFlashcardObject?.relatedExample)

        // Make a copy if they exist, save to memoized objects
        studentFlashcardObject = studentFlashcardObjectOriginal ? { ...studentFlashcardObjectOriginal } : undefined
        flashcardObject = flashcardObjectOriginal ? { ...flashcardObjectOriginal } : undefined

        // Remove the studentFlashcard and related flashcard object from the cache
        const oldFlashcardsCopy = [...oldFlashcards.examples]
        const oldStudentFlashcardsCopy = [...oldFlashcards.studentExamples]
        const newStudentFlashcardsArray = oldStudentFlashcardsCopy.filter(studentFlashcard => studentFlashcard.recordId !== studentFlashcardId)
        const newFlashcardsArray = oldFlashcardsCopy.filter(flashcard => flashcard.recordId !== studentFlashcardObject?.relatedExample)
        const newFlashcardData = { examples: newFlashcardsArray, studentExamples: newStudentFlashcardsArray }
        const trimmedNewFlashcardData = matchAndTrimArrays(newFlashcardData)
        return trimmedNewFlashcardData
      })
      // Return the memoized objects for rollback
      return { studentFlashcardObject, flashcardObject }
    },
    onError: (error, _variables, context) => {
      console.error(error)
      // Roll back the cache for just the affected flashcard
      // Use the memoized objects to rollback the cache
      const studentFlashcardObject = context?.studentFlashcardObject
      const flashcardObject = context?.flashcardObject
      if (studentFlashcardObject?.recordId && flashcardObject?.recordId) {
        // Only run if the memoized objects exist
        queryClient.setQueryData(['flashcardData', activeStudentId], (oldFlashcards: StudentFlashcardData) => {
          const flashcardsArray: Flashcard[] = [...oldFlashcards?.examples, flashcardObject]
          const studentFlashcardsArray: StudentExample[] = [...oldFlashcards?.studentExamples, studentFlashcardObject]
          const newFlashcardData = { examples: flashcardsArray, studentExamples: studentFlashcardsArray }
          const trimmedNewFlashcardData = matchAndTrimArrays(newFlashcardData)
          return trimmedNewFlashcardData
        })
      }
    },
    onSettled: debouncedRefetch,
  })

  const updateActiveStudentFlashcards = useCallback(async (studentExampleId: number, newInterval: number) => {
    let updatePromise
    if (userDataQuery.data?.isAdmin && activeStudentId) {
      updatePromise = updateStudentExample(studentExampleId, newInterval)
    }
    else if (userDataQuery.data?.role === 'student') {
      updatePromise = updateMyStudentExample(studentExampleId, newInterval)
    }
    if (!updatePromise) {
      throw new Error('No active student')
    }
    const updateResponse = updatePromise
      .then((result: number | undefined) => {
        if (result !== 1) {
          throw new Error('Failed to update Flashcard')
        }
        return result
      })
    return updateResponse
  }, [userDataQuery.data?.isAdmin, userDataQuery.data?.role, activeStudentId, updateStudentExample, updateMyStudentExample])

  const updateFlashcardMutation = useMutation({
    mutationFn: ({ studentExampleId, newInterval }: { studentExampleId: number, newInterval: number }) => updateActiveStudentFlashcards(studentExampleId, newInterval),
    onMutate: async ({ studentExampleId, newInterval }) => {
      // Cancel any in-flight queries
      await queryClient.cancelQueries({ queryKey: ['flashcardData', activeStudentId] })

      // Memoize the old interval for rollback
      let oldInterval: number | undefined
      // Optimistically update the flashcards cache
      queryClient.setQueryData(['flashcardData', activeStudentId], (oldFlashcards: StudentFlashcardData) => {
        const oldFlashcardsCopy = [...oldFlashcards.studentExamples]
        const studentFlashcard = oldFlashcardsCopy.find(studentFlashcard => studentFlashcard.recordId === studentExampleId)
        if (studentFlashcard) {
          oldInterval = studentFlashcard.reviewInterval ? studentFlashcard.reviewInterval : undefined
          const newStudentFLashcard = { ...studentFlashcard, reviewInterval: newInterval }
          const newStudentFlashcardsArray = oldFlashcardsCopy.map(studentFlashcard => studentFlashcard.recordId === studentExampleId ? newStudentFLashcard : studentFlashcard)
          const trimmedNewFlashcardData = matchAndTrimArrays({ examples: oldFlashcards.examples, studentExamples: newStudentFlashcardsArray })
          return trimmedNewFlashcardData
        }
      })
      // Return the studentExampleId and the previous interval for rollback context
      return { studentExampleId, newInterval: oldInterval }
    },
    onError: (error, _variables, context) => {
      console.error(error)
      // Make sure both necessary values are defined
      if (context?.studentExampleId === undefined || context?.newInterval === undefined) {
        return
      }
      // Destructure the context
      const { studentExampleId, newInterval } = context
      // Roll back the cache for just the affected flashcard
      queryClient.setQueryData(['flashcardData', activeStudentId], (oldFlashcards: StudentFlashcardData) => {
        const oldFlashcardsCopy = [...oldFlashcards.studentExamples]
        const studentFlashcard = oldFlashcardsCopy.find(studentFlashcard => studentFlashcard.recordId === studentExampleId)
        if (studentFlashcard) {
          const newStudentFlashcard = { ...studentFlashcard, reviewInterval: newInterval }
          const newStudentFlashcardsArray = oldFlashcardsCopy.map(studentFlashcard => studentFlashcard.recordId === studentExampleId ? newStudentFlashcard : studentFlashcard)
          const trimmedNewFlashcardData = matchAndTrimArrays({ examples: oldFlashcards.examples, studentExamples: newStudentFlashcardsArray })
          return trimmedNewFlashcardData
        }
        return oldFlashcards
      })
    },
    onSettled: debouncedRefetch,
  })

  return { flashcardDataQuery, addFlashcardMutation, removeFlashcardMutation, updateFlashcardMutation }
}
