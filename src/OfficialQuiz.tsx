import type { QuizCourse } from './interfaceDefinitions'
import React, { useEffect, useRef, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'
import Loading from './components/Loading'
import QuizComponent from './components/Quiz/QuizComponent'
import { useOfficialQuizzes } from './hooks/useOfficialQuizzes'
import './App.css'

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

  useEffect(() => {
    if (quizExamplesQuery.isSuccess && !quizExamplesQuery.data?.length) {
      makeMenuShow()
      navigate('..')
    }
  }, [quizExamplesQuery.isSuccess, quizExamplesQuery.data, makeMenuShow, navigate])

  return (
    <>
      {officialQuizzesQuery.data && (
        <>
          {(quizExamplesQuery.isLoading) && (<Loading message="Loading Quiz..." />)}
          {quizExamplesQuery.isError && (<h2 className="error">Error Loading Quiz</h2>)}
          {quizExamplesQuery.data && (
            <QuizComponent
              examplesToParse={quizExamplesQuery.data}
              quizTitle={makeQuizTitle()}
              cleanupFunction={makeMenuShow}
            />
          )}
        </>
      )}
    </>
  )
}
