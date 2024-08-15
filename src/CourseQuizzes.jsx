import React, { useEffect, useRef } from 'react'
import {
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'

import './App.css'

import OfficialQuiz from './OfficialQuiz'

import MenuButton from './components/MenuButton'

export default function CourseQuizzes({
  activeStudent,
  addFlashcard,
  chosenQuiz,
  courses,
  dataLoaded,
  examplesTable,
  getAccessToken,
  hideMenu,
  makeCourseList,
  makeMenuHidden,
  makeMenuShow,
  makeQuizList,
  makeQuizReady,
  makeQuizSelections,
  quizCourse,
  quizReady,
  quizTable,
  removeFlashcard,
  studentExamples,
  studentHasDefaultQuiz,
  thisCourse,
  updateChosenQuiz,
  updateExamplesTable,
  updateQuizCourseWithNavigate,
  updateQuizCourseWithoutNavigate,
}) {
  const navigate = useNavigate()
  const rendered = useRef(false)

  useEffect(() => {
    console.log(1)
    if (!rendered.current) {
      rendered.current = true

      if (quizCourse !== thisCourse) {
        updateQuizCourseWithoutNavigate(thisCourse)
      }
    }
  }, [quizCourse, thisCourse, updateQuizCourseWithoutNavigate])

  useEffect(() => {
    console.log(2)
    if (dataLoaded && !studentHasDefaultQuiz) {
      const firstQuiz = makeQuizList(quizCourse)[0]
      updateChosenQuiz(firstQuiz)
    }
  }, [dataLoaded, studentHasDefaultQuiz, quizCourse, makeQuizList, updateChosenQuiz])

  useEffect(() => {
    console.log(3)
    if (quizReady && chosenQuiz) {
      navigate(chosenQuiz.toString())
    }
  }, [quizReady, chosenQuiz, navigate])

  return (
    <div className="quizInterface">
      {/* Quiz Selector */}

      {dataLoaded && chosenQuiz && quizCourse !== 'lcsp' && !hideMenu && (
        <div className="quizSelector">
          <div className="buttonBox">
            <MenuButton />
          </div>
          <select
            className="quizMenu"
            value={chosenQuiz}
            onChange={e => updateChosenQuiz(e.target.value)}
          >
            {makeQuizSelections()}
          </select>
          <select
            className="quizMenu"
            value={quizCourse}
            onChange={e => updateQuizCourseWithNavigate(e.target.value)}
          >
            {makeCourseList()}
          </select>
          <div className="buttonBox">
            <button type="button" onClick={makeQuizReady}>Begin Review</button>
          </div>
        </div>
      )}
      {dataLoaded && quizCourse !== 'lcsp' && (
        <Routes>
          <Route
            path=":number"
            element={(
              <OfficialQuiz
                activeStudent={activeStudent}
                addFlashcard={addFlashcard}
                chosenQuiz={chosenQuiz}
                courses={courses}
                dataLoaded={dataLoaded}
                examplesTable={examplesTable}
                getAccessToken={getAccessToken}
                hideMenu={hideMenu}
                makeCourseList={makeCourseList}
                makeMenuHidden={makeMenuHidden}
                makeMenuShow={makeMenuShow}
                makeQuizReady={makeQuizReady}
                makeQuizSelections={makeQuizSelections}
                quizCourse={quizCourse}
                quizReady={quizReady}
                quizTable={quizTable}
                removeFlashcard={removeFlashcard}
                studentExamples={studentExamples}
                studentHasDefaultQuiz={studentHasDefaultQuiz}
                thisCourse={thisCourse}
                updateChosenQuiz={updateChosenQuiz}
                updateExamplesTable={updateExamplesTable}
                updateQuizCourseWithNavigate={updateQuizCourseWithNavigate}
                updateQuizCourseWithoutNavigate={updateQuizCourseWithoutNavigate}
              />
            )}
          >
          </Route>
        </Routes>
      )}
    </div>
  )
}
