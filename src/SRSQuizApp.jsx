import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

import {
  updateMyStudentExample,
  updateStudentExample,
} from './BackendFetchFunctions'
import './App.css'
import MenuButton from './components/MenuButton'
import QuizButtons from './components/QuizButtons'
import QuizProgress from './components/QuizProgress'
import FlashcardDisplay from './components/Flashcard'

// TODO:
// - Refactor SRSQuizApp to use the new .isCollected prop instead of .isKnown
//      - this is implemented in Quiz.tsx, just need to modify this file to match Quiz.tsx
export default function SRSQuizApp({
  flashcardDataComplete,
  roles,
  activeStudent,
  activeProgram,
  activeLesson,
  examplesTable,
  studentExamplesTable,
  removeFlashcard,
}) {
  const quizLength = 20
  const { getAccessTokenSilently } = useAuth0()
  const [quizReady, setQuizReady] = useState(false)
  const [examplesToReview, setExamplesToReview] = useState([])
  const [currentExampleNumber, setCurrentExampleNumber] = useState(1)
  const [languageShowing, setLanguageShowing] = useState('english')
  const [playing, setPlaying] = useState(false)
  const currentExample = examplesToReview[currentExampleNumber - 1]
  const [difficultySettable, setDifficultySettable] = useState(true)

  const [answerShowing, setAnswerShowing] = useState(false)
  const startWithSpanish = false
  const currentAudio = useRef(null)
  const spanishShowing = startWithSpanish !== answerShowing

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

  function incrementExample() {
    setCurrentExampleNumber(currentExampleNumber + 1)

    // setLanguageShowing('english')
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

    // setLanguageShowing('english')
    hideAnswer()
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

  async function sendUpdate(exampleId, newInterval) {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: 'https://lcs-api.herokuapp.com/',
          scopes:
            'openid profile email read:current-student update:current-student read:all-students update:all-students',
        },
      })
      if (roles.includes('admin')) {
        const userData = await updateStudentExample(
          accessToken,
          exampleId,
          newInterval,
        ).then(result => result)
        return userData
      }
      else if (roles.includes('student')) {
        const userData = await updateMyStudentExample(
          accessToken,
          exampleId,
          newInterval,
        ).then(result => result)
        return userData
      }
    }
    catch (e) {
      console.error(e.message)
    }
  }

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

  const getStudentExampleFromExample = (example) => {
    const relatedStudentExample = studentExamplesTable.find(
      element => element.relatedExample === example.recordId,
    )
    return relatedStudentExample
  }

  const getIntervalFromExample = (example) => {
    const relatedStudentExample = getStudentExampleFromExample(example)
    const interval = relatedStudentExample.reviewInterval
    return interval
  }

  function increaseDifficulty() {
    const exampleId = getStudentExampleFromExample(currentExample).recordId
    const currentInterval = getIntervalFromExample(currentExample)
    // console.log(studentExamplesTable);
    // console.log('hard');
    currentExample.difficulty = 'hard'
    setDifficultySettable(false)
    if (currentInterval > 0) {
      sendUpdate(exampleId, currentInterval - 1)
    }
    else {
      sendUpdate(exampleId, 0)
    }
    incrementExample()
  }

  function decreaseDifficulty() {
    const exampleId = getStudentExampleFromExample(currentExample).recordId
    const currentInterval = getIntervalFromExample(currentExample)
    // console.log(studentExamplesTable);
    // console.log('easy')
    currentExample.difficulty = 'easy'
    setDifficultySettable(false)
    if (currentInterval >= 0) {
      sendUpdate(exampleId, currentInterval + 1)
    }
    else {
      sendUpdate(exampleId, 1)
    }
    incrementExample()
  }

  const getDueDateFromExample = (example) => {
    const relatedStudentExample = getStudentExampleFromExample(example)
    const dueDate = relatedStudentExample.nextReviewDate
    return dueDate
  }

  function getDueExamples() {
    const isBeforeToday = (dateArg) => {
      const today = new Date()
      // console.log(today)
      const reviewDate = new Date(dateArg)
      // console.log(reviewDate)
      if (reviewDate >= today) {
        return false
      }
      return true
    }
    const allExamples = [...examplesTable]
    const dueExamples = allExamples.filter(
      example =>
        isBeforeToday(
          getDueDateFromExample(example),
        ) /* &&(example.spanglish ==='esp') */,
    )
    // console.log(dueExamples)
    return dueExamples
  }

  function handleSetupQuiz() {
    const quizExamples = getDueExamples()
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
    // console.log(randomizedQuizExamples)
    const limitedExamples = randomizedQuizExamples.slice(0, quizLength)
    limitedExamples.forEach((item) => {
      item.difficulty = 'unset'
    })
    const examplesWithDifficulty = limitedExamples
    // console.log(examplesWithDifficulty)
    setExamplesToReview(examplesWithDifficulty)
    setQuizReady(true)
  }
  useEffect(() => {
    if (currentExample?.difficulty === 'unset') {
      // console.log(currentExample.difficulty)
      setDifficultySettable(true)
    }
    else {
      // console.log(currentExample.difficulty)
      setDifficultySettable(false)
    }
    // console.log(difficultySettable);
  }, [currentExampleNumber, currentExample])

  useEffect(() => {
    setQuizReady(false)
  }, [activeStudent, activeProgram, activeLesson])

  return (
    activeStudent.recordId && (
      <div className="quizInterface">
        {!quizReady && flashcardDataComplete && (
          <div className="readyButton">
            <button type="button" onClick={handleSetupQuiz}>Begin Review</button>
          </div>
        )}

        {quizReady && !examplesToReview[currentExampleNumber - 1] && (
          <div className="finishedMessage">
            <p>
              Looks like you're all caught up! Come back tomorrow for another
              review.
            </p>
            <div className="buttonBox">
              <MenuButton />
            </div>
          </div>
        )}

        {/* Quiz App */}
        {examplesToReview[currentExampleNumber - 1] && quizReady && (
          <div className="quiz">
            {!answerShowing && questionAudio()}
            {answerShowing && answerAudio()}
            <FlashcardDisplay
              example={currentExample}
              isStudent
              answerShowing={answerShowing}
              startWithSpanish={startWithSpanish}
              removeFlashcardAndUpdate={deleteFlashcard}
              toggleAnswer={toggleAnswer}
            />
            <div className="quizControls">
              <div className="buttonBox">
                <button
                  type="button"
                  className="redButton"
                  style={{
                    display:
                      spanishShowing && difficultySettable
                        ? 'block'
                        : 'none',
                  }}
                  onClick={increaseDifficulty}
                >
                  This was hard
                </button>
                <button
                  type="button"
                  className="greenButton"
                  style={{
                    display:
                      spanishShowing && difficultySettable
                        ? 'block'
                        : 'none',
                  }}
                  onClick={decreaseDifficulty}
                >
                  This was easy
                </button>
                <button
                  type="button"
                  className="hardBanner"
                  style={{
                    display:
                      !difficultySettable
                      && currentExample.difficulty === 'hard'
                        ? 'block'
                        : 'none',
                  }}
                >
                  Labeled: Hard
                </button>
                <button
                  type="button"
                  className="easyBanner"
                  style={{
                    display:
                      !difficultySettable
                      && currentExample.difficulty === 'easy'
                        ? 'block'
                        : 'none',
                  }}
                >
                  Labeled: Easy
                </button>
              </div>
              {/* QuizButtons: Will need audio props passed in when it is set up */}
              <QuizButtons
                decrementExample={decrementExample}
                incrementExample={incrementExample}
                togglePlaying={togglePlaying}
                audioActive={audioActive}
                playing={playing}
              />
              <div className="buttonBox">
                <MenuButton />
              </div>
              <QuizProgress
                currentExampleNumber={currentExampleNumber}
                totalExamplesNumber={examplesToReview.length}
              />
            </div>
          </div>
        )}
      </div>
    )
  )
}
