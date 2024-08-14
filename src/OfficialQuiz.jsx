import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import './App.css'
import { getQuizExamplesFromBackend } from './BackendFetchFunctions'
import FlashcardDisplay from './components/Flashcard'
import QuizButtons from './components/QuizButtons'
import QuizProgress from './components/QuizProgress'
import MenuButton from './components/MenuButton'

export default function OfficialQuiz({
  courses,
  quizCourse,
  makeMenuHidden,
  makeMenuShow,
  activeStudent,
  dataLoaded,
  chosenQuiz,
  updateChosenQuiz,
  quizTable,
  studentExamples,
  addFlashcard,
  removeFlashcard,
}) {
  const thisQuiz = Number.parseInt(useParams().number)
  const navigate = useNavigate()
  const audience = import.meta.env.VITE_API_AUDIENCE
  const { getAccessTokenSilently } = useAuth0()

  const rendered = useRef(false)
  const [examplesToReview, setExamplesToReview] = useState([])
  const [quizReady, setQuizReady] = useState(false)
  const [currentExampleNumber, setCurrentExampleNumber] = useState(1)
  const [languageShowing, setLanguageShowing] = useState('english')
  const [playing, setPlaying] = useState(false)

  const whichAudio
    = languageShowing === 'spanish' ? 'spanishAudioLa' : 'englishAudio'

  const currentAudioUrl
    = quizReady && examplesToReview[currentExampleNumber - 1]
      ? examplesToReview[currentExampleNumber - 1][whichAudio]
      : ''

  async function getExamplesForCurrentQuiz() {
    const quizToSearch
      = quizTable.find(
        quiz => quiz.quizNumber === thisQuiz && quiz.quizType === quizCourse,
      ) || {}
    if (quizToSearch.recordId) {
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience,
            scope: 'openID email profile',
          },
        })
        // console.log(accessToken)
        const quizExamples = await getQuizExamplesFromBackend(
          accessToken,
          quizToSearch.recordId,
        ).then((result) => {
          // console.log(result)
          const usefulData = result
          return usefulData
        })
        return quizExamples
      }
      catch (e) {
        console.error(e)
        return []
      }
    }
  }

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

  function tagAssignedExamples(exampleArray) {
    // console.log(exampleArray);
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
  }

  function handleSetupQuiz() {
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
        setExamplesToReview(randomizedQuizExamples)
        setQuizReady(true)
      }
      else {
        navigate('..')
      }
    })
  }

  function togglePlaying() {
    if (playing) {
      setPlaying(false)
    }
    else {
      setPlaying(true)
    }
  }

  function incrementExample() {
    if (currentExampleNumber < examplesToReview.length) {
      const newExampleNumber = currentExampleNumber + 1
      setCurrentExampleNumber(newExampleNumber)
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

  /*
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
  */

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
    if (!rendered.current) {
      rendered.current = true
      if (chosenQuiz !== thisQuiz) {
        updateChosenQuiz(thisQuiz)
      }
      makeMenuHidden()
    }
  }, [])

  useEffect(() => {
    if (dataLoaded) {
      handleSetupQuiz()
    }
  }, [dataLoaded])

  useEffect(() => {
    if (quizReady) {
      if (examplesToReview.length < 1) {
        makeMenuShow()
        navigate('..')
      }
    }
  }, [quizReady])

  return (
    <div>
      {dataLoaded && !quizReady && <h2>Loading Quiz...</h2>}
      {quizReady && (
        <div className="quiz">
          {makeQuizTitle()}
          <FlashcardDisplay example={examplesToReview[currentExampleNumber - 1]} isStudent={activeStudent.role === ('student')} addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} />
          <QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} currentAudioUrl={currentAudioUrl} togglePlaying={togglePlaying} playing={playing} />
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
