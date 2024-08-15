import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import './App.css'
import { getQuizExamplesFromBackend } from './BackendFetchFunctions'
import FlashcardDisplay from './components/Flashcard'
import QuizButtons from './components/QuizButtons'
import QuizProgress from './components/QuizProgress'
import MenuButton from './components/MenuButton'

export default function OfficialQuiz({
  activeStudent,
  addFlashcard,
  chosenQuiz,
  courses,
  dataLoaded,
  getAccessToken,
  makeMenuHidden,
  makeMenuShow,
  quizCourse,
  quizTable,
  removeFlashcard,
  studentExamples,
  updateChosenQuiz,
}) {
  console.log('rendering OfficialQuiz')

  const thisQuiz = Number.parseInt(useParams().number)
  const navigate = useNavigate()

  const rendered = useRef(false)
  const currentAudio = useRef(null)
  const [examplesToReview, setExamplesToReview] = useState([])
  const [quizReady, setQuizReady] = useState(false)
  const [currentExampleNumber, setCurrentExampleNumber] = useState(1)
  const [answerShowing, setAnswerShowing] = useState(false)
  const [playing, setPlaying] = useState(false)

  const currentExample = examplesToReview[currentExampleNumber - 1]

  const startWithSpanish = true
  const spanishShowing = startWithSpanish !== answerShowing

  function hideAnswer() {
    setAnswerShowing(false)
  }

  function toggleAnswer() {
    setAnswerShowing(!answerShowing)
  }

  const spanishAudioUrl = currentExample?.spanishAudioLa
  const englishAudioUrl = currentExample?.englishAudioLa

  function spanishAudio() {
    const audioElement
          = (
            <audio
              ref={currentAudio}
              src={spanishAudioUrl}
              onEnded={setPlaying(false)}
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
              onEnded={setPlaying(false)}
            />
          )
    return audioElement
  }

  const audioActive = spanishShowing ? currentExample?.spanishAudioLa : currentExample?.englishAudioLa

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

  const getExamplesForCurrentQuiz = useCallback(async () => {
    console.log('getting examples for current quiz')
    const quizToSearch
      = quizTable.find(
        quiz => quiz.quizNumber === thisQuiz && quiz.quizType === quizCourse,
      ) || {}
    if (quizToSearch.recordId) {
      try {
        const quizExamples = await getQuizExamplesFromBackend(
          getAccessToken(),
          quizToSearch.recordId,
        )
        return quizExamples
      }
      catch (e) {
        console.error(e)
      }
    }
  }, [thisQuiz, quizCourse, quizTable, getAccessToken])

  function makeQuizTitle() {
    const thisCourse = courses.find(course => course.code === quizCourse)
    const courseName = thisCourse ? thisCourse.name : quizCourse
    if (quizCourse === 'ser-estar') {
      const quizNumberAsString = thisQuiz.toString()
      const lessonNumber = quizNumberAsString[0]
      const thisQuizObject = quizTable.find(
        quiz => quiz.quizNumber === thisQuiz && quiz.quizType === quizCourse,
      )
      const subtitle = thisQuizObject
        ? thisQuizObject.subtitle
        : quizNumberAsString
      return (
        <h3>
          Ser/Estar Lesson
          {' '}
          {lessonNumber}
          ,
          {' '}
          {subtitle}
        </h3>
      )
    }
    else {
      return (
        <h3>
          {courseName}
          {' Quiz '}
          {thisQuiz}
        </h3>
      )
    }
  }

  const tagAssignedExamples = useCallback((exampleArray) => {
    console.log('tagging examples')
    if (studentExamples && exampleArray) {
      exampleArray.forEach((example) => {
        const getStudentExampleRecordId = () => {
          const relatedStudentExample = studentExamples.find(
            element => element.relatedExample === example.recordId,
          )
          return relatedStudentExample
        }
        if (getStudentExampleRecordId() !== undefined) {
          example.isKnown = true
        }
        else {
          example.isKnown = false
        }
      })
    }
    // console.log(exampleArray)
    return exampleArray
  }, [studentExamples])

  const handleSetupQuiz = useCallback(() => {
    console.log('setting up quiz')
    getExamplesForCurrentQuiz().then((examples) => {
      if (examples) {
        const taggedByKnown = tagAssignedExamples(examples)
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
        const randomizedQuizExamples = randomize(taggedByKnown)
        console.log('setting examples to review')
        setExamplesToReview(randomizedQuizExamples)
        console.log('set quiz ready!')
        setQuizReady(true)
      }
      else {
        navigate('..')
      }
    })
  }, [getExamplesForCurrentQuiz, navigate, tagAssignedExamples])

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

  useEffect(() => {
    console.log(1)
    if (!rendered.current) {
      rendered.current = true
      makeMenuHidden()
      if (chosenQuiz !== thisQuiz) {
        updateChosenQuiz(thisQuiz)
      }
    }
  }, [thisQuiz, chosenQuiz, updateChosenQuiz, makeMenuHidden])

  useEffect(() => {
    console.log(2)
    console.log(`dataLoaded: ${dataLoaded}`)
    if (dataLoaded) {
      console.log('setting up quiz')
      handleSetupQuiz()
    }
  }, [dataLoaded, handleSetupQuiz])

  useEffect(() => {
    console.log(3)
    if (quizReady) {
      if (examplesToReview.length < 1) {
        makeMenuShow()
        navigate('..')
      }
    }
  }, [quizReady, examplesToReview, makeMenuShow, navigate])

  return (
    <div>
      {dataLoaded && !quizReady && <h2>Loading Quiz...</h2>}
      {quizReady && (
        <div className="quiz">
          {makeQuizTitle()}
          {!answerShowing && questionAudio()}
          {answerShowing && answerAudio()}
          <FlashcardDisplay example={currentExample} isStudent={activeStudent.role === ('student')} answerShowing={answerShowing} addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} hideAnswer={hideAnswer} />
          <QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} audioActive={audioActive} togglePlaying={togglePlaying} playing={playing} />
          <div className="buttonBox">
            <Link className="linkButton" to=".." onClick={makeMenuShow}>Back to Quizzes</Link>
            <MenuButton />
          </div>
          <QuizProgress currentExampleNumber={currentExampleNumber} totalExamplesNumber={examplesToReview.length} />
        </div>
      )}
    </div>
  )
}
