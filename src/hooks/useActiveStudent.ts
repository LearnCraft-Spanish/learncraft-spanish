import { useContext } from 'react'
import ActiveStudentContext from '../contexts/ActiveStudentContext'

export function useActiveStudent() {
  const context = useContext(ActiveStudentContext)
  if (!context) {
    throw new Error('useActiveStudent must be used within an ActiveStudentProvider')
  }

  const addToActiveStudentFlashcards = useCallback(async (recordId, updateTable = true) => {
    updateBannerMessage('Adding Flashcard...')
    if (activeStudent.recordId && userData.isAdmin) {
      try {
        const data = await createStudentExample(
          activeStudent.recordId,
          recordId,
        ).then((result) => {
          if (result === 1) {
            updateBannerMessage('Flashcard Added!')
            updateTable && updateExamplesTableQuietly()
          }
          else {
            updateBannerMessage('Failed to add Flashcard')
          }
          return result
        })
        return data
      }
      catch (e) {
        console.error(e.message)
      }
    }
    else if (activeStudent.recordId && userData.role === 'student') {
      try {
        const data = await createMyStudentExample(recordId).then(
          (result) => {
            if (result === 1) {
              updateBannerMessage('Flashcard Added!')
              updateTable && updateExamplesTableQuietly()
            }
            else {
              updateBannerMessage('Failed to add Flashcard')
            }
            return result
          },
        )
        return data
      }
      catch (e) {
        console.error(e.message)
        return false
      }
    }
  }, [activeStudent, userData, createMyStudentExample, createStudentExample, updateBannerMessage, updateExamplesTableQuietly])

  const removeFlashcardFromActiveStudent = useCallback(async (exampleRecordId, updateTable = true) => {
    setBannerMessage('Removing Flashcard')
    const exampleRecordIdInt = Number.parseInt(exampleRecordId)
    const getStudentExampleRecordId = () => {
      const relatedStudentExample = studentExamplesTable.find(
        element => element.relatedExample === exampleRecordIdInt,
      )
      return relatedStudentExample?.recordId
    }
    const studentExampleRecordId = getStudentExampleRecordId()
    if (studentExampleRecordId && userData.isAdmin) {
      try {
        const data = await deleteStudentExample(
          studentExampleRecordId,
        ).then((result) => {
          if (result === 1) {
            setBannerMessage('Flashcard removed!')
            updateTable && updateExamplesTableQuietly()
          }
          else {
            setBannerMessage('Failed to remove flashcard')
          }
          return result
        })
        return data
      }
      catch (e) {
        console.error(e.message)
      }
    }
    else if (studentExampleRecordId && userData.role === 'student') {
      try {
        const data = await deleteMyStudentExample(
          studentExampleRecordId,
        ).then((result) => {
          if (result === 1) {
            setBannerMessage('Flashcard removed!')
            updateTable && updateExamplesTableQuietly()
          }
          else {
            setBannerMessage('Failed to remove flashcard')
          }
          return result
        })
        return data
      }
      catch (e) {
        console.error(e.message)
      }
    }
    else {
      setBannerMessage('Flashcard not found')
      return 0
    }
  }, [userData, studentExamplesTable, deleteMyStudentExample, deleteStudentExample, updateExamplesTableQuietly])

  return context
}
