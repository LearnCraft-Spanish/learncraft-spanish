import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import FlashcardDisplay from './components/Flashcard'
import QuizButtons from './components/QuizButtons'
import QuizProgress from './components/QuizProgress'
import MenuButton from './components/MenuButton'

export default function Quiz({
  dataLoaded,
  quizReady,
  makeQuizTitle,

}) {
  const [answerShowing, setAnswerShowing] = useState(false)

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