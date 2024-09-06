import { useCallback, useContext } from 'react'
import debounce from 'lodash/debounce'
import ActiveStudentContext from '../contexts/ActiveStudentContext'

import { useBackend } from './useBackend'
import { useUserData } from './useUserData'

export function useActiveStudent() {
  const context = useContext(ActiveStudentContext)

  // Should this be using the Context, or the useUserData hook?
  const userDataQuery = useUserData()

  const {
    createStudentExample,
    createMyStudentExample,
    deleteStudentExample,
    deleteMyStudentExample,
    updateMyStudentExample,
    updateStudentExample,
  } = useBackend()
  if (!context) {
    throw new Error('useActiveStudent must be used within an ActiveStudentProvider')
  }

  const addToActiveStudentFlashcards = useCallback(async (recordId: number) => {
    context.setFlashcardDataSynced(false)
    // updateBannerMessage('Adding Flashcard...')
    if (context.activeStudent?.recordId && userDataQuery.data?.isAdmin) {
      try {
        const data = await createStudentExample(
          context.activeStudent?.recordId,
          recordId,
        ).then((result: number | undefined) => {
          if (result === 1) {
            // updateBannerMessage('Flashcard Added!')
            debounce(context.syncFlashcards, 500)
          }
          else {
            console.error('Failed to add Flashcard')
            // updateBannerMessage('Failed to add Flashcard')
          }
          return result
        })
        return data
      }
      catch (e: unknown) {
        if (e instanceof Error) {
          console.error(e.message)
        }
        else {
          console.error('An unexpected error occurred:', e)
        }
        return false
      }
    }
    else if (context.activeStudent?.recordId && userDataQuery.data?.role === 'student') {
      try {
        const data = await createMyStudentExample(recordId)
          .then((result) => {
            if (result === 1) {
              // updateBannerMessage('Flashcard Added!')
              context.syncFlashcards()
            }
            else {
              // updateBannerMessage('Failed to add Flashcard')
              console.error('Failed to add Flashcard')
            }
            return result
          })
        return data
      }
      catch (e: unknown) {
        if (e instanceof Error) {
          console.error(e.message)
        }
        else {
          console.error('An unexpected error occurred:', e)
        }
        return false
      }
    }
  }, [context, userDataQuery.data?.isAdmin, userDataQuery.data?.role, createStudentExample, createMyStudentExample])

  const removeFlashcardFromActiveStudent = useCallback(async (exampleRecordId: number) => {
    context.setFlashcardDataSynced(false)
    // setBannerMessage('Removing Flashcard')
    const exampleRecordIdInt = exampleRecordId
    const getStudentExampleRecordId = () => {
      const relatedStudentExample = context.studentFlashcardData?.studentExamples?.find(
        element => element.relatedExample === exampleRecordIdInt,
      )
      return relatedStudentExample?.recordId
    }
    const studentExampleRecordId = getStudentExampleRecordId()
    if (studentExampleRecordId && userDataQuery.data?.isAdmin) {
      try {
        const data = await deleteStudentExample(studentExampleRecordId)
          .then((result) => {
            if (result === 1) {
              // setBannerMessage('Flashcard removed!')
              context.syncFlashcards()
            }
            else {
              // setBannerMessage('Failed to remove flashcard')
              console.error('Failed to remove flashcard')
            }
            return result
          })
        return data
      }
      catch (e: unknown) {
        if (e instanceof Error) {
          console.error(e.message)
        }
        else {
          console.error('An unexpected error occurred:', e)
        }
      }
    }
    else if (studentExampleRecordId && userDataQuery.data?.role === 'student') {
      try {
        const data = await deleteMyStudentExample(studentExampleRecordId)
          .then((result) => {
            if (result === 1) {
              // setBannerMessage('Flashcard removed!')
              context.syncFlashcards()
            }
            else {
              // setBannerMessage('Failed to remove flashcard')
              console.error('Failed to remove flashcard')
            }
            return result
          })
        return data
      }
      catch (e: unknown) {
        if (e instanceof Error) {
          console.error(e.message)
        }
        else {
          console.error('An unexpected error occurred:', e)
        }
      }
    }
    else {
      // setBannerMessage('Flashcard not found')
      console.error('Flashcard not found')
      return 0
    }
  }, [userDataQuery.data?.isAdmin, userDataQuery.data?.role, context, deleteStudentExample, deleteMyStudentExample])

  const updateActiveStudentFlashcard = useCallback(async (studentExampleRecordId: number, newInterval: number) => {
    context.setFlashcardDataSynced(false)
    // updateBannerMessage('Updating Flashcard...')
    if (context.activeStudent?.recordId && userDataQuery.data?.isAdmin) {
      try {
        const data = await updateStudentExample(studentExampleRecordId, newInterval)
          .then((result: number | undefined) => {
            if (result === studentExampleRecordId) {
              // updateBannerMessage('Flashcard Updated!')
              context.syncFlashcards()
            }
            else {
              console.error('Failed to update Flashcard')
              // updateBannerMessage('Failed to update Flashcard')
            }
            return result
          })
        return data
      }
      catch (e: unknown) {
        if (e instanceof Error) {
          console.error(e.message)
        }
        else {
          console.error('An unexpected error occurred:', e)
        }
      }
    }
    else if (context.activeStudent?.recordId && userDataQuery.data?.role === 'student') {
      try {
        const data = await updateMyStudentExample(studentExampleRecordId, newInterval)
          .then((result) => {
            if (result === studentExampleRecordId) {
              // updateBannerMessage('Flashcard Updated!')
              context.syncFlashcards()
            }
            else {
              console.error('Failed to update Flashcard')
              // updateBannerMessage('Failed to update Flashcard')
            }
            return result
          })
        return data
      }
      catch (e: unknown) {
        if (e instanceof Error) {
          console.error(e.message)
        }
        else {
          console.error('An unexpected error occurred:', e)
        }
      }
    }
  }, [context, userDataQuery.data?.isAdmin, userDataQuery.data?.role, updateStudentExample, updateMyStudentExample])
  return {
    activeStudent: context.activeStudent,
    activeLesson: context.activeLesson,
    activeProgram: context.activeProgram,
    updateActiveStudent: context.updateActiveStudent,
    studentFlashcardData: context.studentFlashcardData,
    programTable: context.programTable,
    audioExamplesTable: context.audioExamplesTable,
    studentList: context.studentList,
    chooseStudent: context.chooseStudent,
    keepStudent: context.keepStudent,
    choosingStudent: context.choosingStudent,
    flashcardDataSynced: context.flashcardDataSynced,
    syncFlashcards: context.syncFlashcards,

    addToActiveStudentFlashcards,
    removeFlashcardFromActiveStudent,
    updateActiveStudentFlashcard,
  }
}
