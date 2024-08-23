import React, { useEffect } from 'react'

import { formatEnglishText, formatSpanishText } from './functions/formatFlashcardText'
import type { Flashcard } from './interfaceDefinitions'
import { useActiveStudent } from './hooks/useActiveStudent'

function FlashcardManager() {
  const [displayExamplesTable, setDisplayExamplesTable] = React.useState<Flashcard[]>([])

  const { studentFlashcardData, flashcardDataSynced, removeFlashcardFromActiveStudent, addToActiveStudentFlashcards } = useActiveStudent()
  // examplesTable, studentExamplesTable,
  async function removeAndUpdate(recordId: number | string) {
    if (typeof recordId === 'string') {
      recordId = Number.parseInt(recordId)
    }
    const filteredTable = displayExamplesTable.filter(
      item =>
        item.recordId !== getExamplefromStudentExampleId(recordId).recordId,
    )
    setDisplayExamplesTable(filteredTable)
    const result = await removeFlashcardFromActiveStudent(recordId)
    if (result) {
      if (result === 1) {
        return []
      }
    }
  }

  function getStudentExampleFromExampleId(exampleId: number) {
    const studentExample = studentFlashcardData?.studentExamples.find(
      item => item.relatedExample === exampleId,
    )

    return studentExample || { recordId: -1, dateCreated: '', relatedExample: -1 }
  }

  function getExamplefromStudentExampleId(studentExampleId: number) {
    const example = studentFlashcardData?.examples.find(
      item => item.recordId === studentExampleId,
    )
    return example || {
      recordId: -1,
      spanishExample: '',
      englishTranslation: '',
      spanglish: '',
    }
  }

  function createDisplayExamplesTable(tableToDisplay: Flashcard[]) {
    const sortedExamples = tableToDisplay.sort((a, b) => {
      const aStudentExample = getStudentExampleFromExampleId(a?.recordId)
      const bStudentExample = getStudentExampleFromExampleId(b?.recordId)
      const aDate = new Date(aStudentExample.dateCreated)
      const bDate = new Date(bStudentExample.dateCreated)
      if (a.spanglish === 'spanglish' && b.spanglish !== 'spanglish') {
        return -1
      }
      else if (a.spanglish !== 'spanglish' && b.spanglish === 'spanglish') {
        return 1
      }
      else if (aDate > bDate) {
        return -1
      }
      else if (aDate < bDate) {
        return 1
      }
      else {
        return 0
      }
    })

    const finalTable = sortedExamples.map(item => (
      <div className="exampleCard" key={item.recordId}>
        <div className="exampleCardSpanishText">
          {formatSpanishText(item.spanglish, item.spanishExample)}
        </div>
        <div className="exampleCardEnglishText">
          {formatEnglishText(item.englishTranslation)}
        </div>
        {item.spanglish === 'spanglish' && (
          <div className="spanglishLabel">
            <h4>Spanglish</h4>
          </div>
        )}
        {item.spanglish !== 'spanglish' && (
          <div className="spanishLabel">
            <h4>Spanish</h4>
          </div>
        )}
        {flashcardDataSynced
          ? (
              <button
                type="button"
                className="redButton"
                value={item.recordId}
                onClick={e =>
                  removeAndUpdate(Number.parseInt((e.target as HTMLButtonElement).value))}
              >
                Remove
              </button>
            )
          : (
              <button
                type="button"
                className="redButton"
                value={item.recordId}
              >
                Syncing...
              </button>
            )}

      </div>
    ))
    return finalTable
  }

  useEffect(() => {
    setDisplayExamplesTable(studentFlashcardData?.examples || [])
  }, [studentFlashcardData?.examples])

  return (
    <div>
      <h2>Flashcard Manager</h2>
      <h4>
        Total flashcards:
        {displayExamplesTable.length}
      </h4>
      <div className="exampleCardContainer">
        {createDisplayExamplesTable(displayExamplesTable)}
      </div>
    </div>
  )
}

export default FlashcardManager
