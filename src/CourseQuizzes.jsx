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
  chosenQuiz,
  courses,
  dataLoaded,
  hideMenu,
  makeCourseList,
  makeMenuHidden,
  makeMenuShow,
  makeQuizReady,
  makeQuizSelections,
  quizCourse,
  quizReady,
  quizTable,
  studentHasDefaultQuiz,
  thisCourse,
  updateChosenQuiz,
  updateQuizCourseWithNavigate,
  updateQuizCourseWithoutNavigate,
}) {
  const navigate = useNavigate()
  const rendered = useRef(false)

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
      const firstQuiz = makeQuizSelections(quizCourse)[0]
      updateChosenQuiz(firstQuiz)
    }
  }, [dataLoaded, studentHasDefaultQuiz, quizCourse, makeQuizSelections, updateChosenQuiz])

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
                chosenQuiz={chosenQuiz}
                courses={courses}
                dataLoaded={dataLoaded}
                makeMenuHidden={makeMenuHidden}
                makeMenuShow={makeMenuShow}
                quizCourse={quizCourse}
                quizTable={quizTable}
                updateChosenQuiz={updateChosenQuiz}
              />
            )}
          >
          </Route>
        </Routes>
      )}
    </div>
  )
}
