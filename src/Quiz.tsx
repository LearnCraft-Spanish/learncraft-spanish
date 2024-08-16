import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import type { Flashcard, StudentExample, UserData } from './interfaceDefinitions'
import FlashcardDisplay from './components/Flashcard'
import QuizButtons from './components/QuizButtons'
import QuizProgress from './components/QuizProgress'
import MenuButton from './components/MenuButton'

interface QuizProps {
  quizTitle: string
  examplesToParse: Flashcard[]
  activeStudent: UserData
  startWithSpanish?: boolean
  studentExamples: StudentExample[]
  quizOnlyCollectedExamples?: boolean
  isSrsQuiz?: boolean
  addFlashcard: (recordId: number) => Promise<number>
  removeFlashcard: (recordId: number) => Promise<number>
  cleanupFunction: () => void
}

function parseExampleTable(exampleArray: Flashcard[], studentExampleArray: StudentExample[], quizOnlyCollectedExamples: boolean, isSrsQuiz: boolean): Flashcard[] {
  function tagAssignedExamples() {
    exampleArray.forEach((example) => {
      const getStudentExampleRecordId = () => {
        const relatedStudentExample = studentExampleArray.find(
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
  return randomizedQuizExamples
}

// removeFlashcardAndUpdate
// addFlashcardAndUpdate
export default function Quiz({
  activeStudent,
  examplesToParse,
  quizTitle,
  startWithSpanish = false,
  studentExamples,
  quizOnlyCollectedExamples = false,
  isSrsQuiz = false,
  addFlashcard,
  removeFlashcard,
  cleanupFunction = () => {},

}: QuizProps) {
  const location = useLocation()

  const [examplesToReview, setExamplesToReview] = useState(parseExampleTable(examplesToParse, studentExamples, quizOnlyCollectedExamples, isSrsQuiz))
  const [answerShowing, setAnswerShowing] = useState(false)
  const [currentExampleNumber, setCurrentExampleNumber] = useState(1)
  const currentAudio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  // This is copied from OfficialQuiz, I think it might be causing excessive rerenders
  const currentExample = examplesToReview[currentExampleNumber - 1]

  // will need to second pass these variables:
  const spanishShowing = startWithSpanish !== answerShowing

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
        flashcardRemovedPromise.then((result) => {
          if (result !== 1) {
            const updatedArray = [...examplesToReview]
            updatedArray.splice(exampleIndex, 0, exampleToRemove)
            setExamplesToReview(updatedArray)
          }
        })
      }
      else {
        const updatedArray = [...examplesToReview]
        updatedArray[exampleIndex].isCollected = false
        setExamplesToReview(updatedArray)
        flashcardRemovedPromise
          .then((result) => {
            if (result !== 1) {
              const updatedArray = [...examplesToReview]
              updatedArray[exampleIndex].isCollected = true
              setExamplesToReview(updatedArray)
            }
          })
      }
    }
  }

  async function addFlashcardAndUpdate(recordId: number) {
    if (!quizOnlyCollectedExamples && !isSrsQuiz) {
      const flashcardAddedPromise = addFlashcard(recordId)
      const exampleToAdd = examplesToReview.find(
        (example: Flashcard) => example.recordId === recordId,
      )
      if (exampleToAdd) {
        const exampleIndex = examplesToReview.indexOf(exampleToAdd)
        const updatedArray = [...examplesToReview]
        updatedArray[exampleIndex].isCollected = true
        setExamplesToReview(updatedArray)
        if (await flashcardAddedPromise !== 1) {
          const updatedArray = [...examplesToReview]
          updatedArray[exampleIndex].isCollected = false
          setExamplesToReview(updatedArray)
        }
      }
    }
  }

  return (
    examplesToReview.length > 0 && (
      <div className="quiz">
        <h3>{quizTitle}</h3>
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