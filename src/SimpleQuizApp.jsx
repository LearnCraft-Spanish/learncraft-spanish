import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'

import './App.css'
import MenuButton from './components/MenuButton'
import FlashcardDisplay from './components/Flashcard'

export default function SimpleQuizApp({
  updateBannerMessage,
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

  function tagAssignedExamples() {
    examplesTable.forEach((example) => {
      example.isKnown = true
    })
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

  function handleSetupQuiz() {
    tagAssignedExamples()
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
    = quizReady && examplesToReview[currentExampleNumber - 1]?.[whichAudio]

  async function removeFlashcardAndUpdate(exampleRecordId) {
    setLanguageShowing('english')
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
    const wasFlashcardRemoved = removeFlashcard(exampleRecordId).then(
      (numberRemoved) => {
        if (numberRemoved !== 1) {
          const restoredReviewList = [...examplesToReview]
          restoredReviewList.splice(removedExampleIndex, 0, removedExample)
          setExamplesToReview(restoredReviewList)
          if (currentExampleNumber === removedExampleIndex) {
            setLanguageShowing('english')
            setCurrentExampleNumber(removedExampleIndex + 1)
          }
        }
      },
    )
    return wasFlashcardRemoved
  }

  function addFlashcardAndUpdate() {
    updateBannerMessage('Error adding flashcard')
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
        {quizReady && (examplesToReview.length > 0) && (
          <div className="quiz">
            <FlashcardDisplay example={examplesToReview[currentExampleNumber - 1]} isStudent={activeStudent.role === ('student')} removeFlashcardAndUpdate={removeFlashcardAndUpdate} addFlashcardAndUpdate={addFlashcardAndUpdate} />
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
        )}
      </div>
    )
  )
}
