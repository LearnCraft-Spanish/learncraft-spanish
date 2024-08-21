import React, { useState } from 'react'

import './App.css'
import MenuButton from './components/MenuButton'
import Quiz from './Quiz'

import type { Flashcard, StudentExample, UserData } from './interfaceDefinitions'
import { useActiveStudent } from './hooks/useActiveStudent'
import { useUserData } from './hooks/useUserData'

interface SRSQuizAppProps {
  flashcardDataComplete: boolean
  examplesTable: Flashcard[]
  addFlashcard: (recordId: number) => Promise<number>
  removeFlashcard: (recordId: number) => Promise<number>
  makeMenuShow: () => void
}

// TODO:
// - Refactor SRSQuizApp to use the new .isCollected prop instead of .isKnown
//      - this is implemented in Quiz.tsx, just need to modify this file to match Quiz.tsx
export default function SRSQuizApp({
  flashcardDataComplete,
  examplesTable,
  addFlashcard,
  removeFlashcard,
  makeMenuShow,
}: SRSQuizAppProps) {
  // const quizLength = 20 //will be used to determine how many examples to review

  const { activeStudent, studentExamplesTable } = useActiveStudent()
  const [quizReady, setQuizReady] = useState(false)
  const [examplesToReview, setExamplesToReview] = useState<Flashcard[]>([])

  /*        Setup Quiz Functions        */

  const getStudentExampleFromExample = (example: Flashcard) => {
    const relatedStudentExample = studentExamplesTable.find(
      element => element.relatedExample === example.recordId,
    )
    return relatedStudentExample
  }

  const getDueDateFromExample = (example: Flashcard) => {
    const relatedStudentExample = getStudentExampleFromExample(example)
    if (!relatedStudentExample) {
      return ''
    }
    const dueDate = relatedStudentExample.nextReviewDate
    return dueDate
  }

  function getDueExamples() {
    const isBeforeToday = (dateArg: string) => {
      const today = new Date()
      const reviewDate = new Date(dateArg)
      if (reviewDate >= today) {
        return false
      }
      return true
    }
    const allExamples = [...examplesTable]
    const dueExamples = allExamples.filter(
      example =>
        isBeforeToday(
          getDueDateFromExample(example),
        ),
    )
    // console.log(dueExamples)
    return dueExamples
  }

  function handleSetupQuiz() {
    const dueExamples = getDueExamples()
    setExamplesToReview(dueExamples)
    setQuizReady(true)
  }

  return (
    activeStudent?.recordId && (
      <div className="quizInterface">
        {!quizReady && flashcardDataComplete && (
          <div className="readyButton">
            <button type="button" onClick={handleSetupQuiz}>Begin Review</button>
          </div>
        )}

        {(quizReady && !(examplesToReview.length > 0)) && (
          <div className="finishedMessage">
            <p>
              Looks like you're all caught up! Come back tomorrow for another
              review.
            </p>
            <div className="buttonBox">
              <MenuButton />
            </div>
          </div>
        )}

        {(quizReady && examplesToReview.length > 0) && (
          <Quiz
            quizTitle="SRS Quiz"
            examplesToParse={examplesToReview}
            quizOnlyCollectedExamples
            isSrsQuiz
            addFlashcard={addFlashcard}
            removeFlashcard={removeFlashcard}
            cleanupFunction={makeMenuShow}
          />
        )}
      </div>
    )
  )
}
