import { useCallback, useContext } from 'react'
import ActiveStudentContext from '../contexts/ActiveStudentContext'

import { useBackend } from './useBackend'
import { useUserData } from './useUserData'

export function useActiveStudent() {
  const context = useContext(ActiveStudentContext)

  // Should this be using the Context, or the useUserData hook?
  const userData = useUserData()

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

  const addToActiveStudentFlashcards = useCallback(async (recordId: number, updateTable = true) => {
    // updateBannerMessage('Adding Flashcard...')
    if (context.activeStudent?.recordId && userData.userData?.isAdmin) {
      try {
        const data = await createStudentExample(
          context.activeStudent?.recordId,
          recordId,
        ).then((result: number | undefined) => {
          if (result === 1) {
            // updateBannerMessage('Flashcard Added!')
            if (updateTable) {
              context.syncFlashcards()
            }
          }
          else {
            console.error('Failed to add Flashcard')
            // updateBannerMessage('Failed to add Flashcard')
          }
          return result
        })
        return data
      }
      catch (e: any) {
        console.error(e.message)
      }
    }
    else if (context.activeStudent?.recordId && userData.userData?.role === 'student') {
      try {
        const data = await createMyStudentExample(recordId)
          .then((result) => {
            if (result === 1) {
              // updateBannerMessage('Flashcard Added!')
              if (updateTable) {
                context.syncFlashcards()
              }
            }
            else {
              // updateBannerMessage('Failed to add Flashcard')
              console.error('Failed to add Flashcard')
            }
            return result
          })
        return data
      }
      catch (e: any) {
        console.error(e.message)
        return false
      }
    }
  }, [context, userData.userData?.isAdmin, userData.userData?.role, createStudentExample, createMyStudentExample])

  const removeFlashcardFromActiveStudent = useCallback(async (exampleRecordId: any, updateTable = true) => {
    // setBannerMessage('Removing Flashcard')
    const exampleRecordIdInt = Number.parseInt(exampleRecordId)
    const getStudentExampleRecordId = () => {
      const relatedStudentExample = context.studentFlashcardData?.studentExamples?.find(
        element => element.relatedExample === exampleRecordIdInt,
      )
      return relatedStudentExample?.recordId
    }
    const studentExampleRecordId = getStudentExampleRecordId()
    if (studentExampleRecordId && userData.userData?.isAdmin) {
      try {
        const data = await deleteStudentExample(studentExampleRecordId)
          .then((result) => {
            if (result === 1) {
              // setBannerMessage('Flashcard removed!')
              if (updateTable) {
                context.syncFlashcards()
              }
            }
            else {
              // setBannerMessage('Failed to remove flashcard')
              console.error('Failed to remove flashcard')
            }
            return result
          })
        return data
      }
      catch (e: any) {
        console.error(e.message)
      }
    }
    else if (studentExampleRecordId && userData.userData?.role === 'student') {
      try {
        const data = await deleteMyStudentExample(studentExampleRecordId)
          .then((result) => {
            if (result === 1) {
              // setBannerMessage('Flashcard removed!')
              if (updateTable) {
                context.syncFlashcards()
              }
            }
            else {
              // setBannerMessage('Failed to remove flashcard')
              console.error('Failed to remove flashcard')
            }
            return result
          })
        return data
      }
      catch (e: any) {
        console.error(e.message)
      }
    }
    else {
      // setBannerMessage('Flashcard not found')
      console.error('Flashcard not found')
      return 0
    }
  }, [userData.userData?.isAdmin, userData.userData?.role, context, deleteStudentExample, deleteMyStudentExample])

  const updateActiveStudentFlashcard = useCallback(async (studentExampleRecordId: number, newInterval: number) => {
    // updateBannerMessage('Updating Flashcard...')
    if (context.activeStudent?.recordId && userData.userData?.isAdmin) {
      try {
        const data = await updateStudentExample(studentExampleRecordId, newInterval)
          .then((result: number | undefined) => {
            if (result === 1) {
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
      catch (e: any) {
        console.error(e.message)
      }
    }
    else if (context.activeStudent?.recordId && userData.userData?.role === 'student') {
      try {
        const data = await updateMyStudentExample(studentExampleRecordId, newInterval)
          .then((result) => {
            if (result === 1) {
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
      catch (e: any) {
        console.error(e.message)
      }
    }
  }, [context, userData.userData?.isAdmin, userData.userData?.role, updateStudentExample, updateMyStudentExample])
  return {
    ...context,
    addToActiveStudentFlashcards,
    removeFlashcardFromActiveStudent,
    updateActiveStudentFlashcard,
  }
}
