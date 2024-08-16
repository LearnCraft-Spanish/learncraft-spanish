import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'

import './App.css'
import { ad } from 'vitest/dist/chunks/reporters.C_zwCd4j'
import Quiz from './Quiz'

export default function SimpleQuizApp({
  updateBannerMessage,
  activeStudent,
  examplesTable,
  studentExamples,
  addFlashcard,
  removeFlashcard,
}) {
  const [quizReady, setQuizReady] = useState(false)
  const [examplesToReview, setExamplesToReview] = useState([])
  const [currentExampleNumber, setCurrentExampleNumber] = useState(1)
  const [languageShowing, setLanguageShowing] = useState('english')
  const [playing, setPlaying] = useState(false)

  function togglePlaying() {
    if (playing) {
      setPlaying(false)
    }
    else {
      setPlaying(true)
    }
  }

  function toggleQuizReady() {
    setLanguageShowing('english')
    setPlaying(false)
    if (quizReady) {
      // resetFunction()
    }
    else {
      setQuizReady(true)
    }
  }

  function makeMenuShow() {
    setQuizReady(false)
  }

  function handleSetupQuiz() {
    toggleQuizReady()
  }

  return (
    activeStudent.recordId && (
      <div className="quizInterface">
        {/* Student Selector */}
        <div
          style={{
            display: quizReady ? 'none' : 'flex',
            justifyContent: 'space-around',
          }}
        >
          <button type="button" onClick={handleSetupQuiz}>Begin Review</button>
        </div>

        {/* Back to Menu if Empty */}
        {quizReady && (examplesToReview.length < 1) && <Navigate to="/" />}

        {/* Quiz App */}
        <Quiz
          activeStudent={activeStudent}
          examplesToParse={examplesTable}
          studentExamples={studentExamples}
          quizOnlyCollectedExamples
          quizTitle="My Flashcards"
          addFlashcard={addFlashcard}
          makeMenuShow={makeMenuShow}
          removeFlashcard={removeFlashcard}
        />
      </div>
    )
  )
}
