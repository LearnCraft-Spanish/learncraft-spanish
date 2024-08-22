import React, { useState } from 'react'

import './App.css'
import MenuButton from './components/MenuButton'
import Quiz from './components/Quiz'

import type { Flashcard } from './interfaceDefinitions'
import { useActiveStudent } from './hooks/useActiveStudent'

export default function SRSQuizApp() {
  // const quizLength = 20 //will be used to determine how many examples to review

  const { activeStudent, studentFlashcardData, flashcardDataSynced } = useActiveStudent()
  const [quizReady, setQuizReady] = useState(false)
  const [examplesToReview, setExamplesToReview] = useState<Flashcard[]>([])

  /*        Setup Quiz Functions        */

  const getStudentExampleFromExample = (example: Flashcard) => {
    const relatedStudentExample = studentFlashcardData?.studentExamples.find(
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
    if (!studentFlashcardData) {
      return []
    }
    const isBeforeToday = (dateArg: string) => {
      const today = new Date()
      const reviewDate = new Date(dateArg)
      if (reviewDate >= today) {
        return false
      }
      return true
    }
    const allExamples = [...studentFlashcardData.examples]
    const dueExamples = allExamples.filter(
      example =>
        isBeforeToday(
          getDueDateFromExample(example),
        ),
    )
    return dueExamples
  }

  function handleSetupQuiz() {
    const dueExamples = getDueExamples()
    setExamplesToReview(dueExamples)
    setQuizReady(true)
  }

  function makeMenuShow() {
    setQuizReady(false)
  }

  return (
    activeStudent?.recordId && (
      <div className="quizInterface">
        {!quizReady && flashcardDataSynced && (
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

        {(quizReady && examplesToReview.length) && (
          <Quiz
            quizTitle="SRS Quiz"
            examplesToParse={examplesToReview}
            quizOnlyCollectedExamples
            isSrsQuiz
            cleanupFunction={makeMenuShow}
          />
        )}
      </div>
    )
  )
}
