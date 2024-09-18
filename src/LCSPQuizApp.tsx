import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import './App.css'
import { useActiveStudent } from './hooks/useActiveStudent'
import CourseQuizzes from './CourseQuizzes.jsx'
import MenuButton from './components/MenuButton'
import OfficialQuiz from './OfficialQuiz'
import type { Quiz, QuizCourse } from './interfaceDefinitions'
import { useOfficialQuizzes } from './hooks/useOfficialQuizzes'

interface LCSPQuizAppProps {
  selectedProgram: { recordId: number, name: string } | null
  selectedLesson: { recordId: number, lesson: string } | null
}

export default function LCSPQuizApp({
  selectedProgram,
  selectedLesson,
}: LCSPQuizAppProps) {
  const navigate = useNavigate()
  const { activeStudentQuery } = useActiveStudent()
  const { officialQuizzesQuery } = useOfficialQuizzes(undefined)
  const { isAuthenticated, isLoading } = useAuth0()

  const [quizCourse, setQuizCourse] = useState('lcsp')
  const [chosenQuiz, setChosenQuiz] = useState(2)
  const [hideMenu, setHideMenu] = useState(false)
  const [quizReady, setQuizReady] = useState(false)
  const studentHasDefaultQuiz = useRef(false)
  const courses = useRef <QuizCourse[]> ([
    { name: 'Spanish in One Month', url: 'si1m', code: 'si1m' },
    { name: 'LearnCraft Spanish', url: '', code: 'lcsp' },
    { name: 'LearnCraft Spanish Extended', url: 'lcspx', code: 'lcspx' },
    { name: 'Master Ser vs Estar', url: 'ser-estar', code: 'ser-estar' },
  ])

  const getCourseUrlFromCode = useCallback((code: string) => {
    const selectedCourse = courses.current.find(course => course.code === code)
    const url = `/officialquizzes${selectedCourse?.url ? '/' : ''}${selectedCourse?.url}`
    return url
  }, [])

  function makeQuizReady() {
    setQuizReady(true)
  }

  const makeQuizUnready = useCallback(() => {
    setQuizReady(false)
  }, [])

  const makeMenuHidden = useCallback(() => {
    if (!hideMenu) {
      setHideMenu(true)
    }
  }, [hideMenu])

  const makeMenuShow = useCallback(() => {
    if (hideMenu) {
      setHideMenu(false)
      makeQuizUnready()
    }
  }, [hideMenu, makeQuizUnready])

  const updateQuizCourseWithNavigate = useCallback((courseCode: string) => {
    studentHasDefaultQuiz.current = false
    const newCourse = courses.current.find(course => course.code === courseCode)
    setQuizCourse(courseCode)
    const urlToNavigate = newCourse?.url || ''
    navigate(urlToNavigate)
  }, [navigate])

  const updateQuizCourseWithoutNavigate = useCallback((courseCode: string) => {
    // const newCourse = courses.current.find(course => course.code === courseCode)
    setQuizCourse(courseCode)
  }, [])

  const updateChosenQuiz = useCallback((quizNumber: number) => {
    // console.log(`chosen quiz now ${quizCourse} ${quizNumber}`)
    studentHasDefaultQuiz.current = false
    setChosenQuiz(quizNumber)
  }, [])

  const makeCourseList = useCallback(() => {
    const courseList: React.JSX.Element[] = []
    let i = 1
    courses.current.forEach((course) => {
      const courseOption = (
        <option key={i} value={course.code}>
          {course.name}
        </option>
      )
      courseList.push(courseOption)
      i++
    })
    return courseList
  }, [courses])

  const makeQuizSelections = useCallback(() => {
    if (officialQuizzesQuery.data) {
      const quizList = officialQuizzesQuery.data.filter(item => item.quizType === quizCourse)
      const quizSelections: React.JSX.Element[] = []
      const courseObj = courses.current.find(
        course => course.code === quizCourse,
      )
      const courseName = courseObj?.name || ''
      let i = 1
      if (quizCourse === 'ser-estar') {
        quizList.forEach((item) => {
          quizSelections.push(
            <option key={i} value={item.quizNumber}>
              {'Ser/Estar Lesson '}
              {item.lessonNumber}
              {', '}
              {item.subtitle}
            </option>,
          )
          i++
        })
      }
      else {
        quizList.forEach((item) => {
        // console.log(item)
          quizSelections.push(
            <option key={i} value={item.quizNumber}>
              {courseName}
              {' Quiz '}
              {item.quizNumber}
            </option>,
          )
          i++
        })
      }
      return quizSelections
    }
  }, [courses, quizCourse, officialQuizzesQuery.data])

  const findDefaultQuiz = useCallback(() => {
    studentHasDefaultQuiz.current = true
    const activeCourse = courses.current.find(
      course => course.name === selectedProgram?.name,
    )
    if (activeCourse) {
      if (activeCourse.code !== 'lcsp' && quizCourse === 'lcsp') {
        setQuizCourse(activeCourse.code)
        const urlToNavigate = activeCourse.url
        navigate(urlToNavigate)
      }
    }
    const activeLessonArray = selectedLesson?.lesson.split(' ')
    if (activeLessonArray && officialQuizzesQuery.data) {
      const activeLessonString = activeLessonArray.slice(-1)[0]
      const activeLessonNumber = Number.parseInt(activeLessonString)
      let lastQuizBeforeCurrentLesson = 0
      const activeQuizzes = officialQuizzesQuery.data.filter(
        item => item.quizType === quizCourse,
      )
      activeQuizzes.forEach((item) => {
        if (item.quizNumber <= activeLessonNumber) {
          lastQuizBeforeCurrentLesson = item.quizNumber
        }
      })
      if (lastQuizBeforeCurrentLesson > 0) {
        setChosenQuiz(lastQuizBeforeCurrentLesson)
      }
      else {
        studentHasDefaultQuiz.current = false
      }
    }
  }, [selectedLesson, selectedProgram, quizCourse, officialQuizzesQuery.data, navigate])

  function createRoutesFromCourses() {
    const routes: React.JSX.Element[] = []
    courses.current.forEach((course) => {
      routes.push(
        <Route
          key={course.code}
          path={`${course.url}/*`}
          element={(
            <CourseQuizzes
              chosenQuiz={chosenQuiz}
              courses={courses.current}
              hideMenu={hideMenu}
              makeCourseList={makeCourseList}
              makeMenuHidden={makeMenuHidden}
              makeMenuShow={makeMenuShow}
              makeQuizReady={makeQuizReady}
              makeQuizSelections={makeQuizSelections}
              quizCourse={quizCourse}
              quizReady={quizReady}
              studentHasDefaultQuiz={studentHasDefaultQuiz}
              thisCourse={course.code}
              updateChosenQuiz={updateChosenQuiz}
              updateQuizCourseWithNavigate={updateQuizCourseWithNavigate}
              updateQuizCourseWithoutNavigate={updateQuizCourseWithoutNavigate}
            />
          )}
        />,
      )
    })
    return routes
  }

  useEffect(() => {
    if (quizReady && chosenQuiz && quizCourse === 'lcsp') {
      navigate(chosenQuiz.toString())
    }
  }, [quizReady, chosenQuiz, navigate, quizCourse])

  useEffect(() => {
    if (
      !studentHasDefaultQuiz.current
      && quizCourse
      && officialQuizzesQuery.data
      && !quizReady
      && window.location.pathname === getCourseUrlFromCode(quizCourse)
    ) {
      const firstQuiz = officialQuizzesQuery.data.filter(
        item => item.quizType === quizCourse,
      )[0].quizNumber
      setChosenQuiz(firstQuiz)
    }
  }, [quizCourse, quizReady, officialQuizzesQuery.data, getCourseUrlFromCode])

  useEffect(() => {
    if (
      activeStudentQuery.data?.recordId
      && officialQuizzesQuery.data
      && selectedProgram?.recordId
      && selectedLesson?.recordId
      && window.location.pathname === getCourseUrlFromCode(quizCourse)
    ) {
      findDefaultQuiz()
    }
    else if (!activeStudentQuery.data?.recordId) {
      studentHasDefaultQuiz.current = false
    }
  }, [activeStudentQuery.data?.recordId, selectedProgram?.recordId, selectedLesson?.recordId, officialQuizzesQuery.data, findDefaultQuiz, getCourseUrlFromCode, quizCourse])

  return (isAuthenticated && !isLoading) && (
    <div className="quizInterface">
      {/* Quiz Selector */}
      {officialQuizzesQuery.isLoading && <h2>Loading Quizzes...</h2>}
      {officialQuizzesQuery.isError && <h2>Error Loading Quizzes</h2>}
      {officialQuizzesQuery.isSuccess && chosenQuiz && quizCourse === 'lcsp' && !hideMenu && (
        <div className="quizSelector">
          <h3> Official Quizzes</h3>
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
            onChange={e => updateChosenQuiz(Number.parseInt(e.target.value) || 0)}
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
      <Routes>
        {createRoutesFromCourses()}
        {quizCourse === 'lcsp' && (
          <Route
            path=":number"
            element={(
              <OfficialQuiz
                chosenQuiz={chosenQuiz}
                courses={courses.current}
                makeMenuHidden={makeMenuHidden}
                makeMenuShow={makeMenuShow}
                quizCourse={quizCourse}
                updateChosenQuiz={updateChosenQuiz}
              />
            )}
          >
          </Route>
        )}
      </Routes>
    </div>
  )
}
