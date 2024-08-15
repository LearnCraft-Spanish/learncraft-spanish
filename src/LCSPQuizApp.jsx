import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'

import './App.css'
import {
  getLcspQuizzesFromBackend,
} from './BackendFetchFunctions'
import CourseQuizzes from './CourseQuizzes.jsx'
import MenuButton from './components/MenuButton'
import OfficialQuiz from './OfficialQuiz'

export default function LCSPQuizApp({
  getAccessToken,
  studentExamples,
  activeStudent,
  selectedProgram,
  selectedLesson,
  addFlashcard,
  removeFlashcard,
  updateExamplesTable,
}) {
  const navigate = useNavigate()
  const [quizCourse, setQuizCourse] = useState('lcsp')
  const [dataLoaded, setDataLoaded] = useState(false)
  const [chosenQuiz, setChosenQuiz] = useState('2')
  const [quizTable, setQuizTable] = useState([])
  const [hideMenu, setHideMenu] = useState(false)
  const [quizReady, setQuizReady] = useState(false)
  const rendered = useRef(false)
  const studentHasDefaultQuiz = useRef(false)
  const courses = useRef ([
    { name: 'Spanish in One Month', url: 'si1m', code: 'si1m' },
    { name: 'LearnCraft Spanish', url: '', code: 'lcsp' },
    { name: 'LearnCraft Spanish Extended', url: 'lcspx', code: 'lcspx' },
    { name: 'Master Ser vs Estar', url: 'ser-estar', code: 'ser-estar' },
  ])

  const getCourseUrlFromCode = useCallback((code) => {
    const selectedCourse = courses.current.find(course => course.code === code)
    const url = `/officialquizzes${selectedCourse.url ? '/' : ''}${selectedCourse.url}`
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

  const getLCSPQuizzes = useCallback(async () => {
    try {
      const lessons = await getLcspQuizzesFromBackend(getAccessToken()).then(
        (result) => {
          // console.log(result)
          const usefulData = result
          return usefulData
        },
      )
      // console.log(lessons)
      return lessons
    }
    catch (e) {
      console.error(e.message)
    }
  }, [getAccessToken])

  const updateQuizCourseWithNavigate = useCallback((courseCode) => {
    studentHasDefaultQuiz.current = false
    const newCourse = courses.current.find(course => course.code === courseCode)
    setQuizCourse(courseCode)
    const urlToNavigate = newCourse.url
    navigate(urlToNavigate)
  }, [navigate])

  const updateQuizCourseWithoutNavigate = useCallback((courseCode) => {
    // const newCourse = courses.current.find(course => course.code === courseCode)
    setQuizCourse(courseCode)
  }, [])

  const updateChosenQuiz = useCallback((quizNumber) => {
    // console.log(`chosen quiz now ${quizCourse} ${quizNumber}`)
    studentHasDefaultQuiz.current = false
    setChosenQuiz(quizNumber)
  }, [])

  const makeCourseList = useCallback(() => {
    const courseList = []
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

  function parseQuizzes(quizzes) {
    quizzes.forEach((item) => {
      const itemArray = item.quizNickname.split(' ')
      const quizType = itemArray[0]
      item.quizType = quizType
      if (quizType === 'ser-estar') {
        const quizBigNumber = Number.parseInt(itemArray.slice(-1)[0])
        item.quizNumber = quizBigNumber
        item.lessonNumber = Number.parseInt(itemArray.slice(-1)[0][0])
        const quizSubNumber = Number.parseInt(itemArray.slice(-1)[0][2])
        const numberSubtitleMap = {
          0: 'Short Quiz',
          1: 'Good/Well',
          2: 'Adjectives',
          3: 'Prepositions',
          4: 'Adverbs',
          5: 'Actions',
          6: 'Right and Wrong',
          7: 'Events',
          8: 'Long Quiz',
          9: 'Long Quiz (Everything)',
        }
        const subtitle = numberSubtitleMap[quizSubNumber]
        item.subtitle = subtitle
      }
      else {
        const quizNumber = Number.parseInt(itemArray.slice(-1)[0])
        item.quizNumber = quizNumber
      }
    })

    function sortQuizzes(a, b) {
      const aNumber = a.quizNumber
      const bNumber = b.quizNumber
      const aLetter = a.quizLetter
      const bLetter = b.quizLetter
      if (aNumber === bNumber) {
        if (aLetter && bLetter) {
          if (aLetter < bLetter) {
            return -1
          }
          else {
            return 1
          }
        }
        else {
          return 0
        }
      }
      else {
        return Number.parseInt(aNumber) - Number.parseInt(bNumber)
      }
    }
    quizzes.sort(sortQuizzes)
    return quizzes
  }

  const makeQuizSelections = useCallback(() => {
    const quizList = quizTable.filter(item => item.quizType === quizCourse)
    const quizSelections = []
    const courseName = courses.current.find(
      course => course.code === quizCourse,
    ).name
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
  }, [courses, quizCourse, quizTable])

  const findDefaultQuiz = useCallback(() => {
    studentHasDefaultQuiz.current = true
    const activeCourse = courses.current.find(
      course => course.name === selectedProgram.name,
    )
    if (activeCourse) {
      if (activeCourse.code !== 'lcsp' && quizCourse === 'lcsp') {
        setQuizCourse(activeCourse.code)
        const urlToNavigate = activeCourse.url
        navigate(urlToNavigate)
      }
    }
    const activeLessonArray = selectedLesson.lesson.split(' ')
    const activeLessonString = activeLessonArray.slice(-1)[0]
    const activeLessonNumber = Number.parseInt(activeLessonString)
    let lastQuizBeforeCurrentLesson = 0
    const activeQuizzes = quizTable.filter(
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
  }, [selectedLesson, selectedProgram, quizCourse, quizTable, navigate])

  function createRoutesFromCourses() {
    const routes = []
    courses.current.forEach((course) => {
      routes.push(
        <Route
          key={course.code}
          exact
          path={`${course.url}/*`}
          element={(
            <CourseQuizzes
              activeStudent={activeStudent}
              addFlashcard={addFlashcard}
              chosenQuiz={chosenQuiz}
              courses={courses.current}
              createRoutesFromCourses={createRoutesFromCourses}
              dataLoaded={dataLoaded}
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
              setChosenQuiz={setChosenQuiz}
              studentExamples={studentExamples}
              studentHasDefaultQuiz={studentHasDefaultQuiz}
              thisCourse={course.code}
              updateChosenQuiz={updateChosenQuiz}
              updateExamplesTable={updateExamplesTable}
              updateQuizCourseWithNavigate={updateQuizCourseWithNavigate}
              updateQuizCourseWithoutNavigate={updateQuizCourseWithoutNavigate}
            />
          )}
        />,
      )
    })
    return routes
  }

  // called once at the beginning
  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
      async function startUp() {
        getLCSPQuizzes().then((quizzes) => {
          const parsedQuizTable = parseQuizzes(quizzes)
          setQuizTable(parsedQuizTable)
        })
      }
      startUp()
    }
  }, [getLCSPQuizzes])

  useEffect(() => {
    if (quizTable?.length > 0 && !dataLoaded) {
      setDataLoaded(true)
    }
  }, [quizTable?.length, dataLoaded])

  useEffect(() => {
    if (quizReady && chosenQuiz && quizCourse === 'lcsp') {
      navigate(chosenQuiz.toString())
    }
  }, [quizReady, chosenQuiz, navigate, quizCourse])

  useEffect(() => {
    if (
      !studentHasDefaultQuiz.current
      && quizCourse
      && dataLoaded
      && !quizReady
      && window.location.pathname === getCourseUrlFromCode(quizCourse)
    ) {
      const firstQuiz = quizTable.filter(
        item => item.quizType === quizCourse,
      )[0].quizNumber
      setChosenQuiz(firstQuiz)
    }
  }, [quizCourse, dataLoaded, quizReady, quizTable, getCourseUrlFromCode])

  useEffect(() => {
    if (
      activeStudent.recordId
      && selectedProgram.recordId
      && selectedLesson.recordId
      && quizTable?.length > 0
      && window.location.pathname === getCourseUrlFromCode(quizCourse)
    ) {
      findDefaultQuiz()
    }
    else if (!activeStudent.recordId) {
      studentHasDefaultQuiz.current = false
    }
  }, [activeStudent?.recordId, selectedProgram?.recordId, selectedLesson?.recordId, findDefaultQuiz, getCourseUrlFromCode, quizCourse, quizTable?.length])

  return (
    <div className="quizInterface">
      {/* Quiz Selector */}
      {!dataLoaded && <h2>Loading Quizzes...</h2>}

      {dataLoaded && chosenQuiz && quizCourse === 'lcsp' && !hideMenu && (
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
      <Routes>
        {createRoutesFromCourses()}
        {quizCourse === 'lcsp' && (
          <Route
            path=":number"
            element={(
              <OfficialQuiz
                activeStudent={activeStudent}
                addFlashcard={addFlashcard}
                chosenQuiz={chosenQuiz}
                courses={courses.current}
                dataLoaded={dataLoaded}
                getAccessToken={getAccessToken}
                hideMenu={hideMenu}
                makeCourseList={makeCourseList}
                makeMenuHidden={makeMenuHidden}
                makeMenuShow={makeMenuShow}
                makeQuizReady={makeQuizReady}
                makeQuizSelections={makeQuizSelections}
                quizCourse={quizCourse}
                quizTable={quizTable}
                removeFlashcard={removeFlashcard}
                studentExamples={studentExamples}
                updateChosenQuiz={updateChosenQuiz}
                updateExamplesTable={updateExamplesTable}
              />
            )}
          >
          </Route>
        )}
      </Routes>
    </div>
  )
}
