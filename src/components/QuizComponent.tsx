import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { filter } from 'lodash'
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
  const { flashcardDataQuery, exampleIsCollected } = useStudentFlashcards()

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

  const toggleAnswer = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.currentTime = 0
    }
    setPlaying(false)
    setAnswerShowing(!answerShowing)
  }, [answerShowing])

  /*      Audio Component Section       */

  const spanishAudioUrl = currentExample?.spanishAudioLa || ''
  const englishAudioUrl = currentExample?.englishAudio || ''

  const audioActive: string = spanishShowing ? spanishAudioUrl : englishAudioUrl

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
  const incrementExampleNumber = useCallback(() => {
    if (currentExampleNumber < displayOrder.length) {
      const newExampleNumber = currentExampleNumber + 1
      setCurrentExampleNumber(newExampleNumber)
    }
    else {
      setCurrentExampleNumber(displayOrder.length)
    }
    hideAnswer()
    setPlaying(false)
  }, [currentExampleNumber, displayOrder])

  const decrementExampleNumber = useCallback(() => {
    if (currentExampleNumber > 1) {
      setCurrentExampleNumber(currentExampleNumber - 1)
    }
    else {
      setCurrentExampleNumber(1)
    }
    hideAnswer()
    setPlaying(false)
  }, [currentExampleNumber])

  function onRemove() {
    if (quizOnlyCollectedExamples || isSrsQuiz) {
      const quizLength = displayOrder.length
      if (currentExampleNumber >= quizLength) {
        setCurrentExampleNumber(quizLength - 1)
      }
    }
    else {
      incrementExampleNumber()
    }
  }

  // Filter for reviewing only "My Flashcards"
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

  // Further filter for only SRS examples
  const getStudentExampleFromExampleId = useCallback((exampleId: number) => {
    const relatedStudentExample = flashcardDataQuery.data?.studentExamples.find(
      element => element.relatedExample === exampleId,
    )
    return relatedStudentExample
  }, [flashcardDataQuery.data?.studentExamples])

  const getDueDateFromExampleId = useCallback((exampleId: number) => {
    const relatedStudentExample = getStudentExampleFromExampleId(exampleId)
    if (!relatedStudentExample) {
      return ''
    }
    const dueDate = relatedStudentExample.nextReviewDate
    return dueDate
  }, [getStudentExampleFromExampleId])

  const filterByDueExamples = useCallback((displayOrder: DisplayOrder[]) => {
    if (!isSrsQuiz) {
      return displayOrder
    }
    if (!flashcardDataQuery.data) {
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

    const newDisplayOrder = displayOrder.filter(displayOrder => isBeforeToday(getDueDateFromExampleId(displayOrder.recordId)))
    return newDisplayOrder
  }, [getDueDateFromExampleId, isSrsQuiz, flashcardDataQuery.data])

  const currentFlashcardIsValid = currentExample !== undefined

  // Randomizes the order of the quiz examples for display
  // Runs only once to prevent re-scrambling while in use. Mutations handled elsewhere.
  useEffect(() => {
    if (examplesToParse.length > 0 && !displayOrderReady && quizLength) {
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
      const filteredByCollected = filterIfCollectedOnly(shuffledOrder)

      // If SRS, filter out examples not due for review
      const filteredByDueDate = filterByDueExamples(filteredByCollected)

      // Limit the number of examples to the quizLength
      const limitedOrder = filteredByDueDate.slice(0, quizLength)

      // Display the limited order if any are left
      if (limitedOrder.length > 0) {
        initialDisplayOrder.current = limitedOrder
        setDisplayOrderReady(true)
      }
    }
  }, [examplesToParse, displayOrderReady, quizLength, filterIfCollectedOnly, filterByDueExamples])

  // Defines the actual list of items displayed as a mutable subset of the previous
  useEffect(() => {
    const filteredByCollected = filterIfCollectedOnly(initialDisplayOrder.current)
    setDisplayOrder(filteredByCollected)
  }, [filterIfCollectedOnly])

  /*    Keyboard Controls       */
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      incrementExampleNumber()
    }
    else if (event.key === 'ArrowLeft') {
      decrementExampleNumber()
    }
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      toggleAnswer()
    }
    else if (event.key === ' ') {
      event.preventDefault()
      togglePlaying()
    }
  }, [incrementExampleNumber, decrementExampleNumber, toggleAnswer, togglePlaying])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  return (

    (!!displayOrder.length) && (
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
            togglePlaying={togglePlaying}
            playing={playing}
            audioActive={audioActive}
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
