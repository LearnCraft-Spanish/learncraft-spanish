import React, { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import type { FormEvent } from 'react'

import { set } from 'lodash'
import type { Flashcard } from './interfaceDefinitions'

import { useActiveStudent } from './hooks/useActiveStudent'
import MenuButton from './components/MenuButton'
import Quiz from './components/Quiz'
import SRSQuizApp from './SRSQuizApp'

export default function MyFlashcardsQuiz() {
  const { studentFlashcardData, flashcardDataSynced } = useActiveStudent()
  const [quizExamples, setQuizExamples] = useState<Flashcard[]>(studentFlashcardData?.examples || [])
  const [isSrs, setIsSrs] = useState<boolean>(false)
  const [spanishFirst, setSpanishFirst] = useState<boolean>(false)
  const [quizLength, setQuizLength] = useState<number>(quizExamples.length)
  const [quizReady, setQuizReady] = useState<boolean>(false)

  const navigate = useNavigate()
  const location = useLocation()

  function handleSumbit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setQuizReady(true)

    if (isSrs) {
      navigate('srsquiz')
    }
    else {
      navigate('quiz')
    }
  }

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

  function calculateQuizLengthOptions() {
    const quizLengthOptions = []
    for (let i = 10; i < quizExamples.length; i = 5 * Math.floor(i * 0.315)) {
      quizLengthOptions.push(i)
    }
    quizLengthOptions.push(quizExamples.length)
    return quizLengthOptions
  }

  function makeQuizUnready() {
    setQuizReady(false)
  }

  useEffect(() => {
    if (isSrs) {
      const dueExamples = getDueExamples()
      setQuizExamples(dueExamples)
    }
    else {
      setQuizExamples(studentFlashcardData?.examples || [])
    }
  }, [isSrs, studentFlashcardData?.examples, getDueExamples])

  useEffect(() => {
    if (location.pathname !== '/myflashcards') {
      setQuizReady(true)
    }
  }, [location.pathname])

  return (
    <div>
      {!quizReady && (
        <form className="myFlashcardsForm" onSubmit={e => handleSumbit(e)}>
          <div className="myFlashcardsFormContentWrapper">
            <h3>Review My Flashcards</h3>
            <div>
              <p>
                SRS Quiz:
              </p>
              <label htmlFor="isSrs" className="switch">
                <input type="checkbox" name="Srs" id="isSrs" checked={isSrs} onChange={e => setIsSrs(e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>
            <div>
              <p>Start with Spanish:</p>
              <label htmlFor="spanishFirst" className="switch">
                <input type="checkbox" name="Spanish First" id="spanishFirst" checked={spanishFirst} onChange={e => setSpanishFirst(e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>
            <label htmlFor="quizLength">
              <p>Number of Flashcards:</p>
              <select name="length" id="quizLength" onChange={e => setQuizLength(Number.parseInt(e.target.value))}>
                {calculateQuizLengthOptions().map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="buttonBox">
            <button type="submit">Start Quiz</button>
          </div>
          <div className="buttonBox">
            <MenuButton />
          </div>
        </form>
      )}
      <Routes>
        <Route
          path="quiz"
          element={(
            <Quiz
              examplesToParse={quizExamples}
              quizTitle="My Flashcards"
              quizOnlyCollectedExamples
              cleanupFunction={() => makeQuizUnready()}
              startWithSpanish={spanishFirst}
              quizLength={quizLength}
            />
          )}
        />
        <Route
          path="srsquiz"
          element={(
            <SRSQuizApp
              startWithSpanish={spanishFirst}
              quizLength={quizLength}
              cleanupFunction={() => makeQuizUnready()}
            />
          )}
        />
      </Routes>
      {flashcardDataSynced && !studentFlashcardData?.studentExamples?.length
      && <Navigate to="/" />}
    </div>
  )
}
