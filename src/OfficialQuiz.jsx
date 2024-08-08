import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ReactHowler from 'react-howler'
import { useAuth0 } from '@auth0/auth0-react'

import './App.css'
import { getQuizExamplesFromBackend } from './BackendFetchFunctions'
import MenuButton from './MenuButton'

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

  async function getExamplesForCurrentQuiz() {
    console.log(quizCourse)
    console.log(thisQuiz)
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
        console.log(quizExamples)
        return quizExamples
      }
      catch (e) {
        console.log(e.message)
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
          {' '}
          Quiz
          {thisQuiz}
        </h3>
      )
    }
  }

  const whichAudio
    = languageShowing === 'spanish' ? 'spanishAudioLa' : 'englishAudio'

  const currentAudioUrl
    = quizReady && examplesToReview[currentExampleNumber - 1]
      ? examplesToReview[currentExampleNumber - 1][whichAudio]
      : ''

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
      console.log(examples)
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
    console.log(`Playing: ${!playing}`)
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

  async function addToExamples(recordId) {
    const currentExample = examplesToReview.find(
      example => example.recordId === recordId,
    )
    currentExample.isKnown = true
    incrementExample()
    addFlashcard(recordId)
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

  // const quizNumber = parseInt(useParams().number)
  // console.log(useParams())
  return (
    <div>
      {dataLoaded && !quizReady && <h2>Loading Quiz...</h2>}
      {quizReady && (
        <div className="quiz">
          {makeQuizTitle()}
          {examplesToReview[currentExampleNumber - 1] !== undefined && (
            <div className="exampleBox">
              <div
                style={{
                  display: languageShowing === 'english' ? 'flex' : 'none',
                }}
                className="englishTranslation"
                onClick={toggleLanguageShowing}
              >
                <p>
                  {examplesToReview[currentExampleNumber - 1]
                    ? examplesToReview[currentExampleNumber - 1]
                      .englishTranslation
                    : ''}
                </p>
              </div>
              <div
                style={{
                  display: languageShowing === 'spanish' ? 'flex' : 'none',
                }}
                className="spanishExample"
                onClick={toggleLanguageShowing}
              >
                <p>
                  {examplesToReview[currentExampleNumber - 1]
                    ? examplesToReview[currentExampleNumber - 1].spanishExample
                    : ''}
                </p>
                {activeStudent
                && activeStudent.recordId !== undefined
                && examplesToReview[currentExampleNumber - 1].isKnown
                === false && (
                  <button
                    className="addFlashcardButton"
                    onClick={() =>
                      addToExamples(
                        examplesToReview[currentExampleNumber - 1].recordId,
                      )}
                  >
                    Add to My Flashcards
                  </button>
                )}
              </div>
              {currentAudioUrl && (
                <ReactHowler src={currentAudioUrl} playing={playing} />
              )}
            </div>
          )}
          <div className="buttonBox">
            <button onClick={decrementExample}>Previous</button>
            <button
              style={{ display: currentAudioUrl === '' ? 'none' : 'block' }}
              onClick={togglePlaying}
            >
              Play/Pause Audio
            </button>
            <button onClick={incrementExample}>Next</button>
          </div>
          <div className="buttonBox">
            <Link className="linkButton" to=".." onClick={makeMenuShow}>
              Back to Quizzes
            </Link>
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
}
