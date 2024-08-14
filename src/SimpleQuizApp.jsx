import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import ReactHowler from 'react-howler'

import './App.css'
import MenuButton from './components/MenuButton'

export default function SimpleQuizApp({
  activeStudent,
  examplesTable,
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

  function incrementExample() {
    if (currentExampleNumber < examplesToReview.length) {
      setCurrentExampleNumber(currentExampleNumber + 1)
    }
    else {
      setCurrentExampleNumber(examplesToReview.length)
    }
    setLanguageShowing('english')
    setPlaying(false)
  }

  function decrementExample() {
    if (currentExampleNumber > 1) {
      setCurrentExampleNumber(currentExampleNumber - 1)
    }
    else {
      setCurrentExampleNumber(1)
    }
    setLanguageShowing('english')
    setPlaying(false)
  }

  async function toggleLanguageShowing() {
    if (languageShowing === 'spanish') {
      setLanguageShowing('english')
      setPlaying(false)
    }
    else {
      setLanguageShowing('spanish')
      setPlaying(false)
    }
  }

  function handleSetupQuiz() {
    const quizExamples = examplesTable
    function randomize(array) {
      const randomizedArray = []
      const vanishingArray = [...array]
      for (let i = 0; i < array.length; i++) {
        const randIndex = Math.floor(Math.random() * vanishingArray.length)
        const randomArrayItem = vanishingArray[randIndex]
        vanishingArray.splice(randIndex, 1)
        randomizedArray[i] = randomArrayItem
      }
      return randomizedArray
    }
    const randomizedQuizExamples = randomize(quizExamples)
    setExamplesToReview(randomizedQuizExamples)
    toggleQuizReady()
  }

  const whichAudio
    = languageShowing === 'spanish' ? 'spanishAudioLa' : 'englishAudio'

  const currentAudioUrl
    = quizReady && examplesToReview[currentExampleNumber - 1]
      ? examplesToReview[currentExampleNumber - 1][whichAudio]
      : ''

  async function deleteFlashcard(exampleRecordId) {
    const wasFlashcardRemoved = removeFlashcard(exampleRecordId).then(
      (numberRemoved) => {
        if (numberRemoved === 1) {
          const updatedReviewList = [...examplesToReview]
          const removedExample = examplesToReview.find(
            item => item.recordId === exampleRecordId,
          )
          const removedExampleIndex = examplesToReview.indexOf(removedExample)
          updatedReviewList.splice(removedExampleIndex, 1)
          setExamplesToReview(updatedReviewList)
          if (currentExampleNumber > updatedReviewList.length) {
            setCurrentExampleNumber(updatedReviewList.length)
          }
          setLanguageShowing('english')
        }
      },
    )
    return wasFlashcardRemoved
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
        {quizReady && examplesToReview.length < 1 && <Navigate to="/" />}

        {/* Quiz App */}
        <div style={{ display: quizReady ? 'flex' : 'none' }} className="quiz">
          <div className="exampleBox">
            <div
              style={{
                display: languageShowing === 'english' ? 'flex' : 'none',
              }}
              className="englishTranslation"
              onClick={toggleLanguageShowing}
            >
              <p>
                {examplesToReview[currentExampleNumber - 1]
                  ? examplesToReview[currentExampleNumber - 1]
                    .englishTranslation
                  : ''}
              </p>
            </div>
            <div
              style={{
                display: languageShowing === 'spanish' ? 'flex' : 'none',
              }}
              className="spanishExample"
              onClick={toggleLanguageShowing}
            >
              <p>
                {examplesToReview[currentExampleNumber - 1]
                  ? examplesToReview[currentExampleNumber - 1].spanishExample
                  : ''}
              </p>
              <button
                type="button"
                className="removeFlashcardButton"
                onClick={() =>
                  deleteFlashcard(
                    examplesToReview[currentExampleNumber - 1].recordId,
                  )}
              >
                Remove from My Flashcards
              </button>
            </div>
            <ReactHowler
              src={
                currentAudioUrl === ''
                  ? 'https://mom-academic.s3.us-east-2.amazonaws.com/dbexamples/example+1+spanish+LA.mp3'
                  : currentAudioUrl
              }
              playing={playing}
            />
          </div>
          <div className="buttonBox">
            <button type="button" onClick={decrementExample}>Previous</button>
            <button
              type="button"
              style={{ display: currentAudioUrl === '' ? 'none' : 'inherit' }}
              onClick={togglePlaying}
            >
              Play/Pause Audio
            </button>
            <button type="button" onClick={incrementExample}>Next</button>
          </div>
          <div className="buttonBox">
            <MenuButton />
          </div>
          <div className="progressBar2">
            <div className="progressBarDescription">
              Flashcard
              {' '}
              {currentExampleNumber}
              {' '}
              of
              {' '}
              {examplesToReview.length}
            </div>
          </div>
        </div>
      </div>
    )
  )
}
