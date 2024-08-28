import React, { useCallback, useEffect, useState } from 'react'

import './App.css'
import MenuButton from './components/MenuButton'
import Quiz from './components/Quiz'

import type { Flashcard } from './interfaceDefinitions'
import { useActiveStudent } from './hooks/useActiveStudent'

interface SRSQuizAppProps {
  startWithSpanish?: boolean
  quizLength?: number
  cleanupFunction: () => void
}

export default function SRSQuizApp({
  startWithSpanish = false,
  quizLength,
  cleanupFunction,
}: SRSQuizAppProps) {
  // const quizLength = 20 //will be used to determine how many examples to review

  const { activeStudent, studentFlashcardData, flashcardDataSynced } = useActiveStudent()
  const [quizReady, setQuizReady] = useState(false)
  const [examplesToReview, setExamplesToReview] = useState<Flashcard[]>([])

  /*        Setup Quiz Functions        */

  const getStudentExampleFromExample = useCallback((example: Flashcard) => {
    const relatedStudentExample = studentFlashcardData?.studentExamples.find(
      element => element.relatedExample === example.recordId,
    )
    return relatedStudentExample
  }, [studentFlashcardData])

  const getDueDateFromExample = useCallback((example: Flashcard) => {
    const relatedStudentExample = getStudentExampleFromExample(example)
    if (!relatedStudentExample) {
      return ''
    }
    const dueDate = relatedStudentExample.nextReviewDate
    return dueDate
  }, [getStudentExampleFromExample])

  const getDueExamples = useCallback(() => {
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
  }, [getDueDateFromExample, studentFlashcardData])

  const handleSetupQuiz = useCallback(() => {
    const dueExamples = getDueExamples()
    setExamplesToReview(dueExamples)
    setQuizReady(true)
  }, [getDueExamples])

  function cleanup() {
    setQuizReady(false)
    cleanupFunction()
  }

  useEffect(() => {
    if (!quizReady && flashcardDataSynced) {
      handleSetupQuiz()
    }
  }, [flashcardDataSynced, quizReady, handleSetupQuiz])

  return (
    activeStudent?.recordId && (
      <div className="quizInterface">
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
            startWithSpanish={startWithSpanish}
            cleanupFunction={cleanup}
            quizLength={quizLength}
          />
        )}
      </div>
    )
  )
}
