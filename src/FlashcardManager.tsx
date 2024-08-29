import React, { useEffect } from 'react'

import { result } from 'lodash'
import { Navigate } from 'react-router-dom'
import { formatEnglishText, formatSpanishText } from './functions/formatFlashcardText'
import type { Flashcard } from './interfaceDefinitions'
import { useActiveStudent } from './hooks/useActiveStudent'

function FlashcardManager() {
  const { studentFlashcardData, flashcardDataSynced, removeFlashcardFromActiveStudent } = useActiveStudent()

  const [displayExamplesTable, setDisplayExamplesTable] = React.useState<Flashcard[]>([])

  async function removeAndUpdate(recordId: number | string) {
    if (typeof recordId === 'string') {
      recordId = Number.parseInt(recordId)
    }
    const itemToRemove = displayExamplesTable.find(item => item.recordId === recordId)
    if (itemToRemove?.recordId) {
      const itemPosition = displayExamplesTable.findIndex(
        item => item.recordId === recordId,
      )
      const newTable = [...displayExamplesTable]
      newTable.splice(itemPosition, 1)
      setDisplayExamplesTable(newTable)
      await removeFlashcardFromActiveStudent(recordId)
        .then((result) => {
          if (result !== 1) {
            const itemDisplays = displayExamplesTable.find(item => item.recordId === recordId)
            if (!itemDisplays) {
              const addBackTable = [...displayExamplesTable]
              addBackTable.splice(itemPosition, 0, itemToRemove)
              setDisplayExamplesTable(addBackTable)
            }
          }
        })
        .catch((e: unknown) => {
          if (e instanceof Error) {
            console.error(e)
          }
        })
    }
  }

  function getStudentExampleFromExampleId(exampleId: number) {
    const studentExample = studentFlashcardData?.studentExamples.find(
      item => item.relatedExample === exampleId,
    )

    return studentExample || { recordId: -1, dateCreated: '', relatedExample: -1 }
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
        <button
          type="button"
          className="redButton"
          value={item.recordId}
          onClick={e =>
            removeAndUpdate(Number.parseInt((e.target as HTMLButtonElement).value))}
        >
          Remove
        </button>

      </div>
    ))
    return finalTable
  }

  useEffect(() => {
    setDisplayExamplesTable(studentFlashcardData?.examples || [])
  }, [studentFlashcardData?.examples])

  return studentFlashcardData?.examples?.length
    ? (
        <div>
          <h2>Flashcard Manager</h2>
          <h4>
            {`Total flashcards: ${displayExamplesTable.length}`}
          </h4>
          <div className="exampleCardContainer">
            {createDisplayExamplesTable(displayExamplesTable)}
          </div>
        </div>
      )
    : (
        flashcardDataSynced && <Navigate to="/" />
      )
}

export default FlashcardManager
