import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import './App.css'
import { getQuizExamplesFromBackend } from './functions/BackendFetchFunctions'

import Quiz from './Quiz'

export default function OfficialQuiz({
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
  updateChosenQuiz,
}) {
  const thisQuiz = Number.parseInt(useParams().number)
  const navigate = useNavigate()

  const rendered = useRef(false)

  const [examplesToReview, setExamplesToReview] = useState([])
  const [quizReady, setQuizReady] = useState(false)

  const getExamplesForCurrentQuiz = useCallback(async () => {
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
      return `Ser/Estar Lesson ${lessonNumber}, ${subtitle}`
    }
    else {
      return `${courseName} Quiz ${thisQuiz}`
    }
  }

  const handleSetupQuiz = useCallback(() => {
    getExamplesForCurrentQuiz().then((examples) => {
      if (examples) {
        setExamplesToReview(examples)
        setQuizReady(true)
      }
      else {
        navigate('..')
      }
    })
  }, [getExamplesForCurrentQuiz, navigate])

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
      makeMenuHidden()
      if (chosenQuiz !== thisQuiz) {
        updateChosenQuiz(thisQuiz)
      }
    }
  }, [thisQuiz, chosenQuiz, updateChosenQuiz, makeMenuHidden])

  useEffect(() => {
    if (dataLoaded) {
      handleSetupQuiz()
    }
  }, [dataLoaded, handleSetupQuiz])

  useEffect(() => {
    if (quizReady) {
      if (examplesToReview.length < 1) {
        makeMenuShow()
        navigate('..')
      }
    }
  }, [quizReady, examplesToReview, makeMenuShow, navigate])

  return (
    <>
      {!(dataLoaded && quizReady) && (<div>Loading...</div>)}
      {dataLoaded && quizReady && (
        <Quiz
          examplesToParse={examplesToReview}
          quizTitle={makeQuizTitle()}
          addFlashcard={addFlashcard}
          removeFlashcard={removeFlashcard}
          cleanupFunction={makeMenuShow}
        />
      )}
    </>
  )
}
