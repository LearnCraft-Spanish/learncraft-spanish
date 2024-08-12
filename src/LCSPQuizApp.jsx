import React, { useEffect, useRef, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import './App.css'
import {
  getLcspQuizzesFromBackend,
} from './BackendFetchFunctions'
import CourseQuizzes from './CourseQuizzes.jsx'
import MenuButton from './MenuButton'
import OfficialQuiz from './OfficialQuiz'

export default function LCSPQuizApp({
  studentExamples,
  activeStudent,
  selectedProgram,
  selectedLesson,
  addFlashcard,
}) {
  // console.log(userData)
  const { getAccessTokenSilently } = useAuth0()
  const navigate = useNavigate()
  const [quizCourse, setQuizCourse] = useState('lcsp')
  const [dataLoaded, setDataLoaded] = useState(false)
  const [chosenQuiz, setChosenQuiz] = useState('2')
  const [quizTable, setQuizTable] = useState([])
  const [hideMenu, setHideMenu] = useState(false)
  const [quizReady, setQuizReady] = useState(false)
  const rendered = useRef(false)
  const studentHasDefaultQuiz = useRef(false)
  const courses = [
    { name: 'Spanish in One Month', url: 'si1m', code: 'si1m' },
    { name: 'LearnCraft Spanish', url: '', code: 'lcsp' },
    { name: 'LearnCraft Spanish Extended', url: 'lcspx', code: 'lcspx' },
    { name: 'Master Ser vs Estar', url: 'ser-estar', code: 'ser-estar' },
  ]

  const audience = import.meta.env.VITE_API_AUDIENCE

  function createRoutesFromCourses() {
    const routes = []
    courses.forEach((course) => {
      routes.push(
        <Route
          key={course.code}
          exact
          path={`${course.url}/*`}
          element={(
            <CourseQuizzes
              thisCourse={course.code}
              courses={courses}
              quizReady={quizReady}
              makeQuizReady={makeQuizReady}
              quizCourse={quizCourse}
              updateChosenQuiz={updateChosenQuiz}
              makeCourseList={makeCourseList}
              setChosenQuiz={setChosenQuiz}
              createRoutesFromCourses={createRoutesFromCourses}
              updateQuizCourseWithNavigate={updateQuizCourseWithNavigate}
              updateQuizCourseWithoutNavigate={updateQuizCourseWithoutNavigate}
              makeQuizSelections={makeQuizSelections}
              activeStudent={activeStudent}
              dataLoaded={dataLoaded}
              chosenQuiz={chosenQuiz}
              hideMenu={hideMenu}
              makeMenuHidden={makeMenuHidden}
              makeMenuShow={makeMenuShow}
              quizTable={quizTable}
              studentExamples={studentExamples}
              addFlashcard={addFlashcard}
              studentHasDefaultQuiz={studentHasDefaultQuiz}
            />
          )}
        />,
      )
    })
    return routes
  }

  function getCourseUrlFromCode(code) {
    const selectedCourse = courses.find(course => course.code === code)
    const url = `/officialquizzes${selectedCourse.url ? '/' : ''}${selectedCourse.url}`
    return url
  }

  function makeMenuShow() {
    if (hideMenu) {
      setHideMenu(false)
      makeQuizUnready()
    }
  }

  function makeMenuHidden() {
    if (!hideMenu) {
      setHideMenu(true)
    }
  }

  function makeQuizReady() {
    setQuizReady(true)
  }

  function makeQuizUnready() {
    setQuizReady(false)
  }

  // async function getExamples() {
  //   try {
  //     const accessToken = await getAccessTokenSilently({
  //       authorizationParams: {
  //         audience,
  //         scope: 'openID email profile',
  //       },
  //     })
  //     // console.log(accessToken)
  //     const lessons = await getExamplesFromBackend(accessToken).then(
  //       (result) => {
  //         // console.log(result)
  //         const usefulData = result
  //         return usefulData
  //       },
  //     )
  //     // console.log(lessons)
  //     return lessons
  //   }
  //   catch (e) {
  //     console.error(e.message)
  //   }
  // }

  async function getLCSPQuizzes() {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience,
          scope: 'openID email profile',
        },
      })
      // console.log(accessToken)
      const lessons = await getLcspQuizzesFromBackend(accessToken).then(
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
  }

  function updateQuizCourseWithNavigate(courseCode) {
    studentHasDefaultQuiz.current = false
    const newCourse = courses.find(course => course.code === courseCode)
    setQuizCourse(courseCode)
    const urlToNavigate = newCourse.url
    navigate(urlToNavigate)
  }

  function updateQuizCourseWithoutNavigate(courseCode) {
    // const newCourse = courses.find(course => course.code === courseCode)
    setQuizCourse(courseCode)
  }

  function updateChosenQuiz(quizNumber) {
    // console.log(`chosen quiz now ${quizCourse} ${quizNumber}`)
    studentHasDefaultQuiz.current = false
    setChosenQuiz(quizNumber)
  }

  function makeCourseList() {
    const courseList = []
    let i = 1
    courses.forEach((course) => {
      const courseOption = (
        <option key={i} value={course.code}>
          {course.name}
        </option>
      )
      courseList.push(courseOption)
      i++
    })
    return courseList
  }

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

  function makeQuizSelections() {
    const quizList = quizTable.filter(item => item.quizType === quizCourse)
    const quizSelections = []
    const courseName = courses.find(
      course => course.code === quizCourse,
    ).name
    let i = 1
    if (quizCourse === 'ser-estar') {
      quizList.forEach((item) => {
        quizSelections.push(
          <option key={i} value={item.quizNumber}>
            Ser/Estar Lesson
            {' '}
            {item.lessonNumber}
            ,
            {' '}
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
            {' '}
            Quiz
            {item.quizNumber}
          </option>,
        )
        i++
      })
    }
    return quizSelections
  }

  function findDefaultQuiz() {
    studentHasDefaultQuiz.current = true
    const activeCourse = courses.find(
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
  }

  // called onced at the beginning
  useEffect(() => {
    async function startUp() {
      if (!rendered.current) {
        rendered.current = true
        getLCSPQuizzes().then((quizzes) => {
          const parsedQuizTable = parseQuizzes(quizzes)
          setQuizTable(parsedQuizTable)
        })
      }
    }
    startUp()
  }, [])

  useEffect(() => {
    if (quizTable.length > 0 && !dataLoaded) {
      setDataLoaded(true)
    }
  }, [quizTable])

  useEffect(() => {
    if (quizReady && chosenQuiz && quizCourse === 'lcsp') {
      navigate(chosenQuiz.toString())
    }
  }, [quizReady, chosenQuiz])

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
  }, [quizCourse, dataLoaded, quizReady])

  useEffect(() => {
    if (
      activeStudent.recordId
      && selectedProgram.recordId
      && selectedLesson.recordId
      && quizTable[0]
      && window.location.pathname === getCourseUrlFromCode(quizCourse)
    ) {
      findDefaultQuiz()
    }
    else if (!activeStudent.recordId) {
      studentHasDefaultQuiz.current = false
    }
  }, [activeStudent, selectedProgram, selectedLesson, quizTable])

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
                courses={courses}
                quizCourse={quizCourse}
                makeCourseList={makeCourseList}
                makeQuizSelections={makeQuizSelections}
                activeStudent={activeStudent}
                dataLoaded={dataLoaded}
                chosenQuiz={chosenQuiz}
                updateChosenQuiz={updateChosenQuiz}
                hideMenu={hideMenu}
                makeMenuHidden={makeMenuHidden}
                makeQuizReady={makeQuizReady}
                makeMenuShow={makeMenuShow}
                quizTable={quizTable}
                studentExamples={studentExamples}
                addFlashcard={addFlashcard}
              />
            )}
          >
          </Route>
        )}
      </Routes>
    </div>
  )
}
