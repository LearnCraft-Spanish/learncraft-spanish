import React, { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import type { FormEvent } from 'react'
import type { Flashcard } from './interfaceDefinitions'

import { useStudentFlashcards } from './hooks/useStudentFlashcards'
import MenuButton from './components/MenuButton'
import QuizComponent from './components/QuizComponent'

export default function MyFlashcardsQuiz() {
  const { flashcardDataQuery } = useStudentFlashcards()
  const [isSrs, setIsSrs] = useState<boolean>(false)
  const [spanishFirst, setSpanishFirst] = useState<boolean>(false)
  const [quizLength, setQuizLength] = useState<number>(10)
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

  function calculateQuizLengthOptions() {
    if (!flashcardDataQuery.data?.examples) {
      return [0]
    }
    const quizLengthOptions = []
    for (let i = 10; i < flashcardDataQuery.data?.examples.length; i = 5 * Math.floor(i * 0.315)) {
      quizLengthOptions.push(i)
    }
    quizLengthOptions.push(flashcardDataQuery.data?.examples.length)
    return quizLengthOptions
  }

  function makeQuizUnready() {
    setQuizReady(false)
  }

  useEffect(() => {
    if (location.pathname !== '/myflashcards') {
      setQuizReady(true)
    }
  }, [location.pathname])

  return (
    <div>
      {flashcardDataQuery.isError && <h2>Error Loading Flashcards</h2>}
      {flashcardDataQuery.isLoading && <h2>Loading Flashcard Data...</h2>}
      {(flashcardDataQuery.isSuccess && !flashcardDataQuery.data?.studentExamples?.length)
      && <Navigate to="/" />}
      {!quizReady && flashcardDataQuery.isSuccess && (
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
              <select name="length" id="quizLength" onChange={e => setQuizLength(Number.parseInt(e.target.value))} defaultValue={quizLength}>
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
          element={flashcardDataQuery.data?.examples && (
            <QuizComponent
              examplesToParse={flashcardDataQuery.data?.examples}
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
          element={flashcardDataQuery.data?.examples && (
            <QuizComponent
              examplesToParse={flashcardDataQuery.data?.examples}
              quizTitle="My Flashcards for Today"
              quizOnlyCollectedExamples
              cleanupFunction={() => makeQuizUnready()}
              startWithSpanish={spanishFirst}
              quizLength={quizLength}
              isSrsQuiz
            />
          )}
        />
      </Routes>
    </div>
  )
}
