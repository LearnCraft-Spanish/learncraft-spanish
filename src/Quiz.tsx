import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import FlashcardDisplay from './components/Flashcard'
import QuizButtons from './components/QuizButtons'
import QuizProgress from './components/QuizProgress'
import MenuButton from './components/MenuButton'

// removeFlashcardAndUpdate
// addFlashcardAndUpdate
export default function Quiz({
  dataLoaded,
  quizReady,
  makeQuizTitle,
  examplesToReview,
  activeStudent,
  addFlashcard,
  removeFlashcard,
  makeMenuShow,
  

}) {
  const [answerShowing, setAnswerShowing] = useState(false)
  const [currentExample, setCurrentExample] = useState(examplesToReview[0])
  const [currentExampleNumber, setCurrentExampleNumber] = useState(1)
  const currentAudio = useRef(null)
  const [playing, setPlaying] = useState(false)

  function toggleAnswer() {
    if (currentAudio.current) {
      currentAudio.current.currentTime = 0
    }
    setPlaying(false)
    setAnswerShowing(!answerShowing)
  }
  /*      Audio Component Section       */

  const spanishAudioUrl = currentExample?.spanishAudioLa
  const englishAudioUrl = currentExample?.englishAudio

  function spanishAudio() {
    const audioElement
          = (
            <audio
              ref={currentAudio}
              src={spanishAudioUrl}
              onEnded={() => setPlaying(false)}
            />
          )
    return audioElement
  }

  function englishAudio() {
    const audioElement
          = (
            <audio
              ref={currentAudio}
              src={englishAudioUrl}
              onEnded={() => setPlaying(false)}
            />
          )
    return audioElement
  }

  const audioActive = spanishShowing ? currentExample?.spanishAudioLa : currentExample?.englishAudio

  const questionAudio = startWithSpanish ? spanishAudio : englishAudio
  const answerAudio = startWithSpanish ? englishAudio : spanishAudio

  const playCurrentAudio = useCallback(() => {
    setPlaying(true)
    currentAudio.current.play()
  }, [currentAudio])

  const pauseCurrentAudio = useCallback(() => {
    setPlaying(false)
    currentAudio.current.pause()
  }, [currentAudio])

  const togglePlaying = useCallback(() => {
    playing ? pauseCurrentAudio() : playCurrentAudio()
  }, [playing, pauseCurrentAudio, playCurrentAudio])

  /*     Add/Remove Flashcard Section       */
  function incrementExample() {
    if (currentExampleNumber < examplesToReview.length) {
      const newExampleNumber = currentExampleNumber + 1
      setCurrentExampleNumber(newExampleNumber)
    }
    else {
      setCurrentExampleNumber(examplesToReview.length)
    }
    hideAnswer()
    setPlaying(false)
  }

  function decrementExample() {
    if (currentExampleNumber > 1) {
      setCurrentExampleNumber(currentExampleNumber - 1)
    }
    else {
      setCurrentExampleNumber(1)
    }
    hideAnswer()
    setPlaying(false)
  }
  async function removeFlashcardAndUpdate(recordId) {
    const currentExample = examplesToReview.find(
      example => example.recordId === recordId,
    )
    decrementExample()
    currentExample.isKnown = false
    const flashcardRemovedPromise = removeFlashcard(recordId)
    if (await flashcardRemovedPromise !== 1) {
      currentExample.isKnown = true
    }
  }
  async function addFlashcardAndUpdate(recordId) {
    const currentExample = examplesToReview.find(
      example => example.recordId === recordId,
    )
    incrementExample()
    currentExample.isKnown = true
    const flashcardAddedPromise = addFlashcard(recordId)
    if (await flashcardAddedPromise !== 1) {
      currentExample.isKnown = false
    }
  }

  return (
    <div>
      {dataLoaded && !quizReady && <h2>Loading Quiz...</h2>}
      {quizReady && (
        <div className="quiz">
          {makeQuizTitle()}
          {!answerShowing && questionAudio()}
          {answerShowing && answerAudio()}
          <FlashcardDisplay
            example={currentExample}
            isStudent={activeStudent.role === ('student')}
            answerShowing={answerShowing}
            addFlashcardAndUpdate={addFlashcardAndUpdate}
            removeFlashcardAndUpdate={removeFlashcardAndUpdate}
            toggleAnswer={toggleAnswer}
          />
          <QuizButtons
            decrementExample={decrementExample}
            incrementExample={incrementExample}
            audioActive={audioActive}
            togglePlaying={togglePlaying}
            playing={playing}
          />
          <div className="buttonBox">
            <Link className="linkButton" to=".." onClick={makeMenuShow}>Back to Quizzes</Link>
            <MenuButton />
          </div>
          <QuizProgress
            currentExampleNumber={currentExampleNumber}
            totalExamplesNumber={examplesToReview.length}
          />
        </div>
      )}
    </div>
  )

}