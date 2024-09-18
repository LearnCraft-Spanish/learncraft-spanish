import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { init } from '@sentry/react'
import type { DisplayOrder, Flashcard } from '../interfaceDefinitions'
import { useActiveStudent } from '../hooks/useActiveStudent'
import { useStudentFlashcards } from '../hooks/useStudentFlashcards'
import { fisherYatesShuffle } from '../functions/fisherYatesShuffle'
import FlashcardDisplay from './FlashcardDisplay'
import QuizButtons from './QuizButtons'
import QuizProgress from './QuizProgress'
import MenuButton from './MenuButton'
import SRSQuizButtons from './SRSButtons'

interface QuizComponentProps {
  quizTitle: string
  examplesToParse: readonly Flashcard[]
  startWithSpanish?: boolean
  quizOnlyCollectedExamples?: boolean
  isSrsQuiz?: boolean
  cleanupFunction?: () => void
  quizLength?: number
}

export default function QuizComponent({
  quizTitle,
  examplesToParse = [],
  startWithSpanish = false,
  quizOnlyCollectedExamples = false,
  isSrsQuiz = false,
  cleanupFunction = () => {},
  quizLength = 1000,

}: QuizComponentProps) {
  const location = useLocation()
  const { activeStudent } = useActiveStudent()
  const { exampleIsCollected } = useStudentFlashcards()

  // Orders the examples from the quiz-examples set, examples refer to the data itself.
  const initialDisplayOrder = useRef<DisplayOrder[]>([])
  const [displayOrder, setDisplayOrder] = useState<DisplayOrder[]>([])
  const [displayOrderReady, setDisplayOrderReady] = useState(false)

  // Interactive states within the Quiz
  const [answerShowing, setAnswerShowing] = useState(false)
  const [currentExampleNumber, setCurrentExampleNumber] = useState(1)
  const currentAudio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  // currentExample should never be undefined... how to prevent?
  const currentExample = examplesToParse.find((example) => {
    const currentRecordId = displayOrder[currentExampleNumber - 1]?.recordId
    const exampleRecordId = example.recordId
    return currentRecordId === exampleRecordId
  })

  // will need to second pass these variables:
  const spanishShowing = (startWithSpanish !== answerShowing)

  const isMainLocation = location.pathname.split('/').length < 2

  function hideAnswer() {
    setAnswerShowing(false)
  }

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
    if (currentAudio.current) {
      currentAudio.current.play()
    }
  }, [currentAudio])

  const pauseCurrentAudio = useCallback(() => {
    setPlaying(false)
    if (currentAudio.current) {
      currentAudio.current.pause()
    }
  }, [currentAudio])

  const togglePlaying = useCallback(() => {
    if (playing) {
      pauseCurrentAudio()
    }
    else {
      playCurrentAudio()
    }
  }, [playing, pauseCurrentAudio, playCurrentAudio])

  /*     Increment/Decrement Through Examples       */
  function incrementExampleNumber() {
    if (currentExampleNumber < displayOrder.length) {
      const newExampleNumber = currentExampleNumber + 1
      setCurrentExampleNumber(newExampleNumber)
    }
    else {
      setCurrentExampleNumber(displayOrder.length)
    }
    hideAnswer()
    setPlaying(false)
  }

  function decrementExampleNumber() {
    if (currentExampleNumber > 1) {
      setCurrentExampleNumber(currentExampleNumber - 1)
    }
    else {
      setCurrentExampleNumber(1)
    }
    hideAnswer()
    setPlaying(false)
  }

  function onRemove() {
    if (quizOnlyCollectedExamples || isSrsQuiz) {
      const quizLength = displayOrder.length
      if (currentExampleNumber >= quizLength) {
        setCurrentExampleNumber(quizLength - 1)
      }
    }
  }

  const filterIfCollectedOnly = useCallback((displayOrderArray: DisplayOrder[]) => {
    if (quizOnlyCollectedExamples || isSrsQuiz) {
      const filteredList = displayOrderArray.filter(
        item => exampleIsCollected(item.recordId),
      )
      return filteredList
    }
    else {
      return displayOrderArray
    }
  }, [quizOnlyCollectedExamples, isSrsQuiz, exampleIsCollected])

  const currentFlashcardIsValid = currentExample !== undefined

  // Randomizes the order of the quiz examples for display
  // Runs only once to prevent re-scrambling while in use. Mutations handled elsewhere.
  useEffect(() => {
    if (examplesToParse.length > 0 && !displayOrderReady && quizLength > 0) {
      // Create a basic map of the flashcard objects with recordId and isCollected properties

      const exampleOrder: DisplayOrder[] = examplesToParse.map(
        (example) => {
          return {
            recordId: example.recordId,
          }
        },
      )

      // Randomize the order of the examples
      const shuffledOrder = fisherYatesShuffle(exampleOrder)

      // If collectedOnly or SRS, filter out uncollected examples
      const filteredOrder = filterIfCollectedOnly(shuffledOrder)

      // Limit the number of examples to the quizLength
      const limitedOrder = filteredOrder.slice(0, quizLength)

      // Display the limited order if any are left
      if (limitedOrder.length > 0) {
        initialDisplayOrder.current = limitedOrder
        setDisplayOrderReady(true)
      }
    }
  }, [examplesToParse, displayOrderReady, quizLength, filterIfCollectedOnly])

  // Defines the actual list of items displayed as a mutable subset of the previous
  useEffect(() => {
    const filteredByCollected = filterIfCollectedOnly(initialDisplayOrder.current)
    setDisplayOrder(filteredByCollected)
  }, [filterIfCollectedOnly])

  return (
    displayOrder.length > 0 && (
      <div className="quiz">
        <h3>{quizTitle}</h3>
        {answerShowing ? answerAudio() : questionAudio()}
        {currentFlashcardIsValid && (
          <FlashcardDisplay
            example={currentExample}
            isStudent={activeStudent?.role === ('student')}
            incrementExampleNumber={incrementExampleNumber}
            onRemove={onRemove}
            answerShowing={answerShowing}
            toggleAnswer={toggleAnswer}
            startWithSpanish={startWithSpanish}
          />
        )}

        {isSrsQuiz && currentFlashcardIsValid && (
          <SRSQuizButtons
            currentExample={currentExample}
            answerShowing={answerShowing}
            incrementExampleNumber={incrementExampleNumber}
          />
        )}
        <QuizButtons
          decrementExample={decrementExampleNumber}
          incrementExample={incrementExampleNumber}
          audioActive={audioActive}
          togglePlaying={togglePlaying}
          playing={playing}
        />
        <div className="buttonBox">
          {!isMainLocation && <Link className="linkButton" to=".." onClick={cleanupFunction}>Back</Link>}
          <MenuButton />
        </div>
        <QuizProgress
          currentExampleNumber={currentExampleNumber}
          totalExamplesNumber={displayOrder.length}
        />
      </div>
    )
  )
}
