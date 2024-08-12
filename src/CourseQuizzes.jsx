import React, { useEffect, useRef } from 'react'
import {
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'

import './App.css'

import OfficialQuiz from './OfficialQuiz'

import MenuButton from './MenuButton'

export default function CourseQuizzes({
  thisCourse,
  courses,
  makeQuizList,
  quizReady,
  makeQuizReady,
  quizCourse,
  updateChosenQuiz,
  makeCourseList,
  updateQuizCourseWithoutNavigate,
  updateQuizCourseWithNavigate,
  makeQuizSelections,
  activeStudent,
  dataLoaded,
  updateExamplesTable,
  chosenQuiz,
  hideMenu,
  makeMenuHidden,
  makeMenuShow,
  quizTable,
  examplesTable,
  studentExamples,
  addFlashcard,
  studentHasDefaultQuiz,
}) {
  const rendered = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true

      if (quizCourse !== thisCourse) {
        updateQuizCourseWithoutNavigate(thisCourse)
      }
    }
  }, [quizCourse, thisCourse, updateQuizCourseWithoutNavigate])

  useEffect(() => {
    if (dataLoaded && !studentHasDefaultQuiz) {
      const firstQuiz = makeQuizList(quizCourse)[0]
      updateChosenQuiz(firstQuiz)
    }
  }, [dataLoaded, studentHasDefaultQuiz, quizCourse, makeQuizList, updateChosenQuiz])

  useEffect(() => {
    if (quizReady && chosenQuiz) {
      navigate(chosenQuiz.toString())
    }
  }, [quizReady, chosenQuiz, navigate])

  return (
    <div className="quizInterface">
      {/* Quiz Selector */}

      {dataLoaded && chosenQuiz && quizCourse !== 'lcsp' && !hideMenu && (
        <div className="quizSelector">
          <select
            className="quizMenu"
            value={quizCourse}
            onChange={e => updateQuizCourseWithNavigate(e.target.value)}
          >
            {makeCourseList()}
          </select>
          <select
            className="quizMenu"
            value={chosenQuiz}
            onChange={e => updateChosenQuiz(e.target.value)}
          >
            {makeQuizSelections()}
          </select>
          <div className="buttonBox">
            <button type="button" onClick={makeQuizReady}>Begin Review</button>
          </div>
          <div className="buttonBox">
            <MenuButton />
          </div>
        </div>
      )}
      {dataLoaded && quizCourse !== 'lcsp' && (
        <Routes>
          <Route
            path=":number"
            element={(
              <OfficialQuiz
                courses={courses}
                quizCourse={quizCourse}
                makeCourseList={makeCourseList}
                makeQuizSelections={makeQuizSelections}
                activeStudent={activeStudent}
                dataLoaded={dataLoaded}
                updateExamplesTable={updateExamplesTable}
                chosenQuiz={chosenQuiz}
                updateChosenQuiz={updateChosenQuiz}
                hideMenu={hideMenu}
                makeMenuHidden={makeMenuHidden}
                makeQuizReady={makeQuizReady}
                makeMenuShow={makeMenuShow}
                quizTable={quizTable}
                examplesTable={examplesTable}
                studentExamples={studentExamples}
                addFlashcard={addFlashcard}
              />
            )}
          >
          </Route>
        </Routes>
      )}
    </div>
  )
}
