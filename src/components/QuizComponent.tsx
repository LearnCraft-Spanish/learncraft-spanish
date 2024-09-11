import React, { useCallback, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import type { DisplayOrder, Flashcard, StudentExample } from '../interfaceDefinitions'
import { useActiveStudent } from '../hooks/useActiveStudent'
import { useStudentFlashcards } from '../hooks/useStudentFlashcards'
import FlashcardDisplay from './Flashcard'
import QuizButtons from './QuizButtons'
import QuizProgress from './QuizProgress'
import MenuButton from './MenuButton'
import SRSQuizButtons from './SRSButtons'

interface QuizComponentProps {
  quizTitle: string
  examplesToParse: Flashcard[]
  displayOrder: DisplayOrder[]
  startWithSpanish?: boolean
  quizOnlyCollectedExamples?: boolean
  isSrsQuiz?: boolean
  cleanupFunction?: () => void
  quizLength?: number
}

function parseExampleTable(exampleArray: Flashcard[], studentExampleArray: StudentExample[] | undefined, quizOnlyCollectedExamples: boolean, isSrsQuiz: boolean, quizLength: number): Flashcard[] {
  function tagAssignedExamples() {
    exampleArray.forEach((example) => {
      const getStudentExampleRecordId = () => {
        const relatedStudentExample = studentExampleArray?.find(
          element => element.relatedExample === example.recordId,
        )
        return relatedStudentExample
      }
      if (getStudentExampleRecordId() !== undefined) {
        example.isCollected = true
      }
      else {
        example.isCollected = false
      }
    })
    return exampleArray
  }

  const taggedByCollected = tagAssignedExamples()

  function filterIfCollectedOnly() {
    if (quizOnlyCollectedExamples || isSrsQuiz) {
      const filteredList = taggedByCollected.filter(
        example => example.isCollected,
      )
      if (isSrsQuiz) {
        filteredList.forEach((example) => {
          example.difficulty = ''
        })
      }
      return filteredList
    }
    else {
      return taggedByCollected
    }
  }

  const completeListBeforeRandomization = filterIfCollectedOnly()

  function randomize(array: Flashcard[]) {
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

  const randomizedQuizExamples = randomize(completeListBeforeRandomization)
  const quizLengthSafe = Math.min(quizLength, randomizedQuizExamples.length)
  return randomizedQuizExamples.slice(0, quizLengthSafe)
}

export default function QuizComponent({
  examplesToParse = [],
  quizTitle,
  startWithSpanish = false,
  quizOnlyCollectedExamples = false,
  isSrsQuiz = false,
  cleanupFunction = () => {},
  quizLength = 1000,

}: QuizComponentProps) {
  const location = useLocation()
  const { activeStudent } = useActiveStudent()
  const { flashcardDataQuery, addFlashcardMutation, removeFlashcardMutation } = useStudentFlashcards()
  const studentFlashcardData = flashcardDataQuery.data
  const addFlashcard = addFlashcardMutation.mutate
  const removeFlashcard = removeFlashcardMutation.mutate

  const [examplesToReview, setExamplesToReview] = useState(parseExampleTable(examplesToParse, studentFlashcardData?.studentExamples, quizOnlyCollectedExamples, isSrsQuiz, quizLength))
  const [answerShowing, setAnswerShowing] = useState(false)
  const [currentExampleNumber, setCurrentExampleNumber] = useState(1)
  const currentAudio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  // This is copied from OfficialQuiz, I think it might be causing excessive rerenders
  const currentExample = examplesToReview[currentExampleNumber - 1]

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

  /*     Add/Remove Flashcard Section       */
  function incrementExampleNumber() {
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

  async function removeFlashcardAndUpdate(recordId: number) {
    const flashcardRemovedPromise = removeFlashcard(recordId)
    const exampleToRemove = examplesToReview.find(
      (example: Flashcard) => example.recordId === recordId,
    )
    if (exampleToRemove) {
      const exampleIndex = examplesToReview.indexOf(exampleToRemove)
      if (quizOnlyCollectedExamples || isSrsQuiz) {
        if (exampleIndex === examplesToReview.length - 1) {
          decrementExampleNumber()
        }
        const filteredArray = [...examplesToReview].filter(
          example => example.recordId !== recordId,
        )
        setExamplesToReview(filteredArray)
        return flashcardRemovedPromise
      }
      else {
        const updatedArray = [...examplesToReview]
        updatedArray[exampleIndex].isCollected = false
        setExamplesToReview(updatedArray)
        return flashcardRemovedPromise
      }
    }
  }

  async function addFlashcardAndUpdate(recordId: number) {
    if (!quizOnlyCollectedExamples && !isSrsQuiz) {
      const exampleToAdd = examplesToReview.find(
        (example: Flashcard) => example.recordId === recordId,
      )
      if (exampleToAdd) {
        const flashcardAddedPromise = addFlashcard(exampleToAdd)
        const exampleIndex = examplesToReview.indexOf(exampleToAdd)
        if (exampleIndex < examplesToReview.length - 1) {
          incrementExampleNumber()
        }
        const updatedArray = [...examplesToReview]
        updatedArray[exampleIndex].isCollected = true
        setExamplesToReview(updatedArray)
        return flashcardAddedPromise
      }
    }
  }

  /*    SRS Update Section       */

  function updateExampleDifficulty(recordId: number, difficulty: string) {
    const newArray = examplesToReview.map(example =>
      example.recordId === recordId
        ? { ...example, difficulty }
        : example,
    )
    setExamplesToReview(newArray)
  }

  return (
    examplesToReview.length > 0 && (
      <div className="quiz">
        <h3>{quizTitle}</h3>
        {!answerShowing && questionAudio()}
        {answerShowing && answerAudio()}
        <FlashcardDisplay
          example={currentExample}
          isStudent={activeStudent?.role === ('student')}
          answerShowing={answerShowing}
          addFlashcardAndUpdate={addFlashcardAndUpdate}
          removeFlashcardAndUpdate={removeFlashcardAndUpdate}
          toggleAnswer={toggleAnswer}
          startWithSpanish={startWithSpanish}
        />

        {isSrsQuiz && (
          <SRSQuizButtons
            currentExample={currentExample}
            answerShowing={answerShowing}
            updateExampleDifficulty={updateExampleDifficulty}
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
          totalExamplesNumber={examplesToReview.length}
        />
      </div>
    )
  )
}
