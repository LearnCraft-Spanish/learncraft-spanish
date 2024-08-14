import React, { useEffect } from 'react'

interface Flashcard {
  recordId: number
  spanishExample: string
  englishTranslation: string
  spanglish: string
}

interface StudentExample {
  recordId: number
  dateCreated: string
  relatedExample: number
}

interface FlashcardManagerProps {
  examplesTable: Flashcard[]
  studentExamplesTable: StudentExample[]
  removeFlashcard: (recordId: number) => Promise<number>
  updateExamplesTable: () => void
}

function FlashcardManager({
  examplesTable,
  studentExamplesTable,
  removeFlashcard,
  updateExamplesTable,
}: FlashcardManagerProps) {
  const [displayExamplesTable, setDisplayExamplesTable] = React.useState<
    Flashcard[]
  >([])

  async function removeAndUpdate(recordId: number) {
    const filteredTable = displayExamplesTable.filter(
      item =>
        item.recordId !== getExamplefromStudentExampleId(recordId).recordId,
    )
    setDisplayExamplesTable(filteredTable)
    removeFlashcard(recordId).then((numberRemoved: number) => {
      if (numberRemoved > 0) {
        return []
      }
      else {
        updateExamplesTable()
      }
    })
  }

  function getStudentExampleFromExampleId(exampleId: number) {
    const studentExample = studentExamplesTable.find(
      item => item.relatedExample === exampleId,
    )
    return studentExample || { recordId: -1, dateCreated: '', relatedExample: -1 }
  }

  function getExamplefromStudentExampleId(studentExampleId: number) {
    const example = examplesTable.find(
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
          <h3>{item.spanishExample}</h3>
        </div>
        <div className="exampleCardEnglishText">
          <h4>{item.englishTranslation}</h4>
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
    setDisplayExamplesTable(examplesTable)
  }, [examplesTable, studentExamplesTable])

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
