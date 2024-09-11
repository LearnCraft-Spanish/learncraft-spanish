import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import './App.css'
import { useOfficialQuizzes } from './hooks/useOfficialQuizzes'
import type { DisplayOrder, Program, Quiz, QuizCourse } from './interfaceDefinitions'

import QuizComponent from './components/QuizComponent'

interface officialQuizProps {
  chosenQuiz: number
  courses: QuizCourse[]
  makeMenuHidden: () => void
  makeMenuShow: () => void
  quizCourse: string
  updateChosenQuiz: (quizNumber: number) => void
}

export default function OfficialQuiz({
  chosenQuiz,
  courses,
  makeMenuHidden,
  makeMenuShow,
  quizCourse,
  updateChosenQuiz,
}: officialQuizProps) {
  // Import Statements
  const navigate = useNavigate()
  const rendered = useRef(false)

  // Defining the current quiz from url
  const thisQuiz = Number.parseInt(useParams().number?.toString() || '0')
  const [thisQuizID, setThisQuizID] = useState<number | undefined>(undefined)
  const { officialQuizzesQuery, quizExamplesQuery } = useOfficialQuizzes(thisQuizID)

  // Orders the examples from the quiz-examples set
  const [displayOrder, setDisplayOrder] = useState<DisplayOrder[]>([])

  function makeQuizTitle() {
    const thisCourse = courses.find(course => course.code === quizCourse)
    const courseName = thisCourse ? thisCourse.name : quizCourse
    if (officialQuizzesQuery.data && quizCourse === 'ser-estar') {
      const quizNumberAsString = thisQuiz.toString()
      const lessonNumber = quizNumberAsString[0]
      const thisQuizObject = officialQuizzesQuery.data.find(
        quiz => quiz.quizNumber === thisQuiz && quiz.quizType === quizCourse,
      )
      const subtitle = thisQuizObject
        ? thisQuizObject.subtitle
        : quizNumberAsString
      return `Ser/Estar Lesson ${lessonNumber}, ${subtitle}`
    }
    else {
      return `${courseName} Quiz ${thisQuiz}`
    }
  }

  // Ensures the quiz does display if url is accessed directly:
  // Hides Menu and sets chosen quiz from url
  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
      makeMenuHidden()
      if (chosenQuiz !== thisQuiz) {
        updateChosenQuiz(thisQuiz)
      }
    }
  }, [thisQuiz, chosenQuiz, updateChosenQuiz, makeMenuHidden])

  // Finds the current quiz object and sets the quiz example query state to the quiz id
  useEffect(() => {
    if (officialQuizzesQuery.data && thisQuiz && quizCourse) {
      const quizToSearch = officialQuizzesQuery.data.find(
        quiz => quiz.quizNumber === thisQuiz && quiz.quizType === quizCourse,
      )
      if (quizToSearch?.recordId) {
        setThisQuizID(quizToSearch.recordId)
      }
    }
  }, [officialQuizzesQuery.data, thisQuiz, quizCourse])

  // Randomizes the order of the quiz examples for display
  useEffect(() => {
    if (thisQuizID && quizExamplesQuery.data) {
      const exampleOrder: DisplayOrder[] = quizExamplesQuery.data.map(
        (example) => {
          return {
            recordId: example.recordId,
            displayOrder: Math.random() * 0.5,
          }
        },
      )
      exampleOrder.sort((a, b) => a.displayOrder - b.displayOrder)
      setDisplayOrder(exampleOrder)
    }
  }, [thisQuizID, quizExamplesQuery.data])

  useEffect(() => {
    if (quizExamplesQuery.isSuccess && displayOrder.length < 1) {
      makeMenuShow()
      navigate('..')
    }
  }, [quizExamplesQuery.isSuccess, displayOrder, makeMenuShow, navigate])

  return (
    <>
      {officialQuizzesQuery.data && (
        <>
          {(quizExamplesQuery.isLoading || !displayOrder) && (<h2 className="loading">Loading Quiz...</h2>)}
          {quizExamplesQuery.isError && (<h2 className="error">Error Loading Quiz</h2>)}
          {quizExamplesQuery.data && displayOrder && (
            <QuizComponent
              examplesToParse={quizExamplesQuery.data}
              displayOrder={displayOrder}
              quizTitle={makeQuizTitle()}
              cleanupFunction={makeMenuShow}
            />
          )}
        </>
      )}
    </>
  )
}
