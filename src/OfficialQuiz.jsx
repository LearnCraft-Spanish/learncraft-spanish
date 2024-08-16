import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import './App.css'
import { getQuizExamplesFromBackend } from './BackendFetchFunctions'

import Quiz from './Quiz'

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
  const thisQuiz = Number.parseInt(useParams().number)
  const navigate = useNavigate()

  const rendered = useRef(false)
  // const currentAudio = useRef(null)
  const [examplesToReview, setExamplesToReview] = useState([])
  const [quizReady, setQuizReady] = useState(false)
  // const [currentExampleNumber, setCurrentExampleNumber] = useState(1)
  // const [answerShowing, setAnswerShowing] = useState(false)
  // const [playing, setPlaying] = useState(false)

  // const currentExample = examplesToReview[currentExampleNumber - 1]

  // const startWithSpanish = false
  // const spanishShowing = startWithSpanish !== answerShowing

  // function hideAnswer() {
  //   setAnswerShowing(false)
  // }

  // function toggleAnswer() {
  //   if (currentAudio.current) {
  //     currentAudio.current.currentTime = 0
  //   }
  //   setPlaying(false)
  //   setAnswerShowing(!answerShowing)
  // }

  // const spanishAudioUrl = currentExample?.spanishAudioLa
  // const englishAudioUrl = currentExample?.englishAudio

  // function spanishAudio() {
  //   const audioElement
  //         = (
  //           <audio
  //             ref={currentAudio}
  //             src={spanishAudioUrl}
  //             onEnded={() => setPlaying(false)}
  //           />
  //         )
  //   return audioElement
  // }

  // function englishAudio() {
  //   const audioElement
  //         = (
  //           <audio
  //             ref={currentAudio}
  //             src={englishAudioUrl}
  //             onEnded={() => setPlaying(false)}
  //           />
  //         )
  //   return audioElement
  // }

  // const audioActive = spanishShowing ? currentExample?.spanishAudioLa : currentExample?.englishAudio

  // const questionAudio = startWithSpanish ? spanishAudio : englishAudio
  // const answerAudio = startWithSpanish ? englishAudio : spanishAudio

  // const playCurrentAudio = useCallback(() => {
  //   setPlaying(true)
  //   currentAudio.current.play()
  // }, [currentAudio])

  // const pauseCurrentAudio = useCallback(() => {
  //   setPlaying(false)
  //   currentAudio.current.pause()
  // }, [currentAudio])

  // const togglePlaying = useCallback(() => {
  //   playing ? pauseCurrentAudio() : playCurrentAudio()
  // }, [playing, pauseCurrentAudio, playCurrentAudio])

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

  // const tagAssignedExamples = useCallback((exampleArray) => {
  //   if (studentExamples && exampleArray) {
  //     exampleArray.forEach((example) => {
  //       const getStudentExampleRecordId = () => {
  //         const relatedStudentExample = studentExamples.find(
  //           element => element.relatedExample === example.recordId,
  //         )
  //         return relatedStudentExample
  //       }
  //       if (getStudentExampleRecordId() !== undefined) {
  //         example.isKnown = true
  //       }
  //       else {
  //         example.isKnown = false
  //       }
  //     })
  //   }
  //   return exampleArray
  // }, [studentExamples])

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

  // function incrementExample() {
  //   if (currentExampleNumber < examplesToReview.length) {
  //     const newExampleNumber = currentExampleNumber + 1
  //     setCurrentExampleNumber(newExampleNumber)
  //   }
  //   else {
  //     setCurrentExampleNumber(examplesToReview.length)
  //   }
  //   hideAnswer()
  //   setPlaying(false)
  // }

  // function decrementExample() {
  //   if (currentExampleNumber > 1) {
  //     setCurrentExampleNumber(currentExampleNumber - 1)
  //   }
  //   else {
  //     setCurrentExampleNumber(1)
  //   }
  //   hideAnswer()
  //   setPlaying(false)
  // }

  // async function addFlashcardAndUpdate(recordId) {
  //   const currentExample = examplesToReview.find(
  //     example => example.recordId === recordId,
  //   )
  //   incrementExample()
  //   currentExample.isKnown = true
  //   const flashcardAddedPromise = addFlashcard(recordId)
  //   if (await flashcardAddedPromise !== 1) {
  //     currentExample.isKnown = false
  //   }
  // }

  // async function removeFlashcardAndUpdate(recordId) {
  //   const currentExample = examplesToReview.find(
  //     example => example.recordId === recordId,
  //   )
  //   decrementExample()
  //   currentExample.isKnown = false
  //   const flashcardRemovedPromise = removeFlashcard(recordId)
  //   if (await flashcardRemovedPromise !== 1) {
  //     currentExample.isKnown = true
  //   }
  // }

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

  // return (
  // <div>
  //   {dataLoaded && !quizReady && <h2>Loading Quiz...</h2>}
  //   {quizReady && (
  //     <div className="quiz">
  //       {makeQuizTitle()}
  //       {!answerShowing && questionAudio()}
  //       {answerShowing && answerAudio()}
  //       <FlashcardDisplay example={currentExample} isStudent={activeStudent.role === ('student')} startWithSpanish={startWithSpanish} answerShowing={answerShowing} addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} hideAnswer={hideAnswer} />
  //       <QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} audioActive={audioActive} togglePlaying={togglePlaying} playing={playing} />
  //       <div className="buttonBox">
  //         <Link className="linkButton" to=".." onClick={makeMenuShow}>Back to Quizzes</Link>
  //         <MenuButton />
  //       </div>
  //       <QuizProgress currentExampleNumber={currentExampleNumber} totalExamplesNumber={examplesToReview.length} />
  //     </div>
  //   )}
  // </div>

  /*
  activeStudent,
  examplesToParse,
  quizTitle,
  startWithSpanish = false,
  studentExamples,
  quizOnlyCollectedExamples = false,
  isSrsQuiz = false,
  addFlashcard,
  makeMenuShow,
  removeFlashcard,
    */
  return (
    dataLoaded && quizReady && (
      <Quiz
        activeStudent={activeStudent}
        examplesToParse={examplesToReview}
        quizTitle={makeQuizTitle()}
        studentExamples={studentExamples}
        addFlashcard={addFlashcard}
        makeMenuShow={makeMenuShow}
        removeFlashcard={removeFlashcard}
      />
    )
  )
}
