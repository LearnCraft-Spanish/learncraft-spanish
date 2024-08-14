import './App.css'
import React, { isValidElement, useCallback, useEffect, useRef, useState } from 'react'
import { Route, useLocation, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import {
  createMyStudentExample,
  createStudentExample,
  deleteMyStudentExample,
  deleteStudentExample,
  getActiveExamplesFromBackend,
  getAllUsersFromBackend,
  getAudioExamplesFromBackend,
  getLessonsFromBackend,
  getMyExamplesFromBackend,
  getProgramsFromBackend,
  getUserDataFromBackend,
} from './BackendFetchFunctions'
import logo from './resources/typelogosmall.png'
import Menu from './Menu'
import SimpleQuizApp from './SimpleQuizApp'
import AudioQuiz from './AudioQuiz'
import LoginButton from './components/LoginButton'
import LogoutButton from './components/LogoutButton'
import SRSQuizApp from './SRSQuizApp'
import LCSPQuizApp from './LCSPQuizApp'
import FrequenSay from './FrequenSay'
import NotFoundPage from './NotFoundPage'
import ComprehensionQuiz from './ComprehensionQuiz'
import FlashcardFinder from './FlashcardFinder'
import CallbackPage from './CallbackPage'
import Coaching from './Coaching'
import FlashcardManager from './FlashcardManager'

function App({ SentryRoutes }) {
  // initialize and destructure Auth0 hook and define audience
  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0()
  const audience = import.meta.env.VITE_API_AUDIENCE

  // React Router hooks
  const location = useLocation()
  const navigate = useNavigate()

  // Flags and state for user data and menu readiness
  const rendered = useRef(false) // Flag to make useEffect run only once
  const [menuReady, setMenuReady] = useState(false) // Flag to indicate that the user data has been loaded and the menu can be displayed
  const [flashcardDataComplete, setFlashcardDataComplete] = useState(false) // Flag to indicate that the flashcard data has been loaded and the flashcard apps can be displayed

  // User data and active student
  const [qbUserData, setQbUserData] = useState({}) // The user data for the person using the app (if a student)
  const [activeStudent, setActiveStudent] = useState({}) // The user data for the selected user (same as the user if a student, or possibly another student if user is an admin)

  // Reference to the active student's program and lesson
  const activeProgram = useRef({})
  const activeLesson = useRef({})

  // States for initial data load independent of user access level
  const [programTable, setProgramTable] = useState([]) // Array of course objects. Each has a property of 'lessons': an array of lesson objects
  const [audioExamplesTable, setAudioExamplesTable] = useState([]) // Array of all audio examples, used to determin whether audio quiz is available

  // States for Lesson Selector
  const [selectedLesson, setSelectedLesson] = useState(activeLesson.current)
  const [selectedProgram, setSelectedProgram] = useState(activeProgram.current)

  // States for Admins to choose a student
  const [studentList, setStudentList] = useState([])
  const [choosingStudent, setChoosingStudent] = useState(false)

  // States for Students to see their flashcards
  const [studentExamplesTable, setStudentExamplesTable] = useState([])
  const examplesTable = useRef([])

  // States for banner message
  const [bannerMessage, setBannerMessage] = useState('')
  const messageNumber = useRef(0)

  // Reference to the current contextual menu element
  const currentContextual = useRef(null)
  const [contextual, setContextual] = useState('') // String to indicate which contextual menu is open

  // global function returns promise for access token
  const getAccessToken = useCallback(async () => {
    const accessToken = await getAccessTokenSilently({
      authorizationParams: {
        audience,
        scope:
          'openid profile email read:current-student update:current-student read:all-students update:all-students',
      },
      cacheMode: 'off',
    })
    return accessToken
  }, [audience, getAccessTokenSilently])

  // global functions to open and close any contextual menus – hard limit to one at a time
  const openContextual = useCallback((elementClass) => {
    setContextual(elementClass)
  }, [])

  const closeContextual = useCallback(() => {
    setContextual('')
  }, [])

  // local function to close contextual menu if click is outside of it
  function closeContextualIfClickOut(e) {
    if (
      isValidElement(currentContextual.current)
      || currentContextual.current instanceof Element
    ) {
      const contextualItemBounds
        = currentContextual.current.getBoundingClientRect()
      const eventX = e.clientX
      const eventY = e.clientY
      const leftOfLeftBound = eventX <= contextualItemBounds.left
      const rightOfRightBound = eventX >= contextualItemBounds.right
      const aboveTopBound = eventY >= contextualItemBounds.bottom
      const belowBottomBound = eventY <= contextualItemBounds.top
      const outOfBounds
        = leftOfLeftBound
        || rightOfRightBound
        || aboveTopBound
        || belowBottomBound
      if (outOfBounds) {
        closeContextual()
      }
    }
  }

  // local functions for admins to choose or keep a student from the menu
  function chooseStudent() {
    setChoosingStudent(true)
  }

  function keepStudent() {
    setChoosingStudent(false)
  }

  const updateSelectedLesson = useCallback((lessonId) => {
    let newLesson = {}
    programTable.forEach((program) => {
      const foundLesson = program.lessons.find(
        item => item.recordId === Number.parseInt(lessonId),
      )
      if (foundLesson) {
        newLesson = foundLesson
      }
    })
    setSelectedLesson(newLesson)
  }, [programTable])

  const updateSelectedProgram = useCallback((programId) => {
    const programIdNumber = Number.parseInt(programId)
    const newProgram
      = programTable.find(program => program.recordId === programIdNumber)
      || (activeProgram.current.recordId
        ? activeProgram.current
        : programTable.find(program => program.recordId === 2))
    setSelectedProgram(newProgram)
    if (
      activeLesson.current.recordId
      && newProgram.recordId === activeProgram.current.recordId
    ) {
      const lessonToSelect = activeLesson.current.recordId
      updateSelectedLesson(lessonToSelect)
    }
    else {
      const firstLesson = newProgram.lessons[0]
      const lessonToSelect = firstLesson.recordId
      updateSelectedLesson(lessonToSelect)
    }
  }, [programTable, activeProgram, activeLesson, updateSelectedLesson])

  const updateActiveStudent = useCallback((studentID) => {
    const studentIDNumber = Number.parseInt(studentID)
    const newStudent
      = studentList.find(student => student.recordId === studentIDNumber) || {}
    setChoosingStudent(false)
    setActiveStudent(newStudent)
  }, [studentList])

  const getUserData = useCallback(async () => {
    try {
      const userData = await getUserDataFromBackend(getAccessToken()).then(
        (result) => {
          const usefulData = result[0]
          return usefulData
        },
      )
      return userData
    }
    catch (e) {
      console.error(e?.message)
    }
  }, [getAccessToken])

  const getStudentList = useCallback(async () => {
    try {
      const allStudentData = await getAllUsersFromBackend(getAccessToken()).then(
        (result) => {
          const usefulData = result
          return usefulData
        },
      )
      return allStudentData[0]
    }
    catch (e) {
      console.error(e.message)
    }
  }, [getAccessToken])

  const userSetup = useCallback(async () => {
    try {
      const userData = await getUserData()
      setQbUserData(await userData)
    }
    catch (e) {
      console.error(e.message)
    }
  }, [getUserData])

  const updateBannerMessage = useCallback((message) => {
    setBannerMessage(message)
  }, [])

  const blankBanner = useCallback(() => {
    setBannerMessage('')
  }, [])

  const parseCourseLessons = useCallback(async () => {
    async function getLessons() {
      try {
        const lessons = await getLessonsFromBackend(getAccessToken()).then(
          (result) => {
            const usefulData = result
            return usefulData
          },
        )
        return lessons
      }
      catch (e) {
        console.error(e.message)
      }
    }
    async function getPrograms() {
      try {
        const programs = await getProgramsFromBackend(getAccessToken()).then(
          (result) => {
            const usefulData = result
            return usefulData
          },
        )
        return programs
      }
      catch (e) {
        console.error(e.message)
      }
    }
    const lessonTable = await getLessons()
    const courses = await getPrograms()
    function parseLessonsByVocab() {
      courses.forEach((course) => {
        const combinedVocabulary = []
        const lessonSortFunction = (a, b) => {
          function findNumber(stringLesson) {
            const lessonArray = stringLesson.split(' ')
            const lessonNumber = lessonArray.slice(-1)
            const lessonNumberInt = Number.parseInt(lessonNumber)
            return lessonNumberInt
          }
          return findNumber(a.lesson) - findNumber(b.lesson)
        }
        const parsedLessonArray = []

        lessonTable.forEach((lesson) => {
          if (Number.parseInt(lesson.relatedProgram) === Number.parseInt(course.recordId)) {
            parsedLessonArray.push(lesson)
          }
        })
        parsedLessonArray.sort(lessonSortFunction)
        course.lessons = parsedLessonArray
        course.lessons.forEach((lesson) => {
          lesson.vocabIncluded.forEach((word) => {
            if (!combinedVocabulary.includes(word)) {
              combinedVocabulary.push(word)
            }
          })
          lesson.vocabKnown = [...combinedVocabulary]
        })
      })
      return courses
    }
    Promise.all(courses, lessonTable).then(() => {
      const parsedLessons = parseLessonsByVocab()
      setProgramTable(parsedLessons)
      return parsedLessons
    })
  }, [getAccessToken])

  const getStudentLevel = useCallback(() => {
    let studentProgram
      = programTable.find(
        program => program.recordId === activeStudent.relatedProgram,
      ) || {}
    const studentCohort = activeStudent.cohort
    const cohortFieldName = `cohort${studentCohort}CurrentLesson`
    const cohortLesson = Number.parseInt(studentProgram[cohortFieldName])
    const maxLesson = typeof cohortLesson === 'number' ? cohortLesson : 9999
    let lastKnownLesson = {}
    if (studentProgram.recordId) {
      const programWithLessonList = { ...studentProgram }
      const lessonList = []
      studentProgram.lessons.forEach((lesson) => {
        const lessonArray = lesson.lesson.split(' ')
        const lessonString = lessonArray.slice(-1)[0]
        const lessonNumber = Number.parseInt(lessonString)
        if (lessonNumber <= maxLesson) {
          lessonList.push(lesson)
        }
      })
      programWithLessonList.lessons = lessonList
      studentProgram = programWithLessonList
      lastKnownLesson = programWithLessonList.lessons.slice(-1)[0] || {}
    }
    activeProgram.current = studentProgram
    activeLesson.current = lastKnownLesson
    if (activeProgram.current.recordId && activeLesson.current.recordId) {
      updateSelectedProgram(activeProgram.current.recordId)
      updateSelectedLesson(activeLesson.current.recordId)
    }
    else {
      updateSelectedProgram(2)
      updateSelectedLesson(2)
    }
  }, [activeStudent, programTable, updateSelectedProgram, updateSelectedLesson])

  const updateExamplesTableQuietly = useCallback(async () => {
    if (qbUserData?.isAdmin) {
      try {
        const studentExampleData = await getActiveExamplesFromBackend(
          getAccessToken(),
          activeStudent.recordId,
          activeStudent.emailAddress,
        ).then(result => result)
        examplesTable.current = studentExampleData.examples
        setStudentExamplesTable(studentExampleData.studentExamples)
        setFlashcardDataComplete(true)
      }
      catch (e) {
        console.error(e.message)
      }
    }
    else if (qbUserData?.role === 'student') {
      // Pulls examples and student examples ONLY for the current user
      try {
        const userExampleData = await getMyExamplesFromBackend(
          getAccessToken(),
        ).then(result => result)
        setStudentExamplesTable(userExampleData.studentExamples)
        examplesTable.current = userExampleData.examples
        setFlashcardDataComplete(true)
      }
      catch (e) {
        console.error(e.message)
      }
    }
  }, [getAccessToken, activeStudent, qbUserData])

  const updateExamplesTable = useCallback(async () => {
    setFlashcardDataComplete(false)
    updateExamplesTableQuietly()
  }, [updateExamplesTableQuietly])

  const makeStudentSelector = useCallback(() => {
    if (qbUserData.isAdmin) {
      const studentSelector = [
        <option key={0} name="">
          {' '}
          -- None Selected --
        </option>,
      ]
      studentList.forEach((student) => {
        const studentEmail = student.emailAddress
        if (!studentEmail.includes('(')) {
          studentSelector.push(
            <option
              key={student.recordId}
              name={student.name || 'zzz'}
              value={student.recordId}
            >
              {student.name}
              {' '}
              (
              {student.emailAddress}
              )
            </option>,
          )
        }
      })
      function studentSelectorSortFunction(a, b) {
        const aName = a.props.name
        const bName = b.props.name
        if (aName > bName) {
          return 1
        }
        else {
          return -1
        }
      }
      studentSelector.sort(studentSelectorSortFunction)
      return studentSelector
    }
  }, [qbUserData, studentList])

  const addToActiveStudentFlashcards = useCallback(async (recordId) => {
    updateBannerMessage('Adding Flashcard...')
    if (activeStudent.recordId && qbUserData.isAdmin) {
      try {
        const data = await createStudentExample(
          getAccessToken(),
          activeStudent.recordId,
          recordId,
        ).then((result) => {
          if (result === 1) {
            updateBannerMessage('Flashcard Added!')
            updateExamplesTableQuietly()
          }
          else {
            updateBannerMessage('Failed to add Flashcard')
          }
          return result
        })
        return data
      }
      catch (e) {
        console.error(e.message)
      }
    }
    else if (activeStudent.recordId && qbUserData.role === 'student') {
      try {
        const data = await createMyStudentExample(getAccessToken(), recordId).then(
          (result) => {
            if (result === 1) {
              updateBannerMessage('Flashcard Added!')
              updateExamplesTableQuietly()
            }
            else {
              updateBannerMessage('Failed to add Flashcard')
            }
            return result
          },
        )
        return data
      }
      catch (e) {
        console.error(e.message)
        return false
      }
    }
  }, [activeStudent, qbUserData, getAccessToken, updateBannerMessage, updateExamplesTableQuietly])

  const removeFlashcardFromActiveStudent = useCallback(async (exampleRecordId) => {
    setBannerMessage('Removing Flashcard')
    const exampleRecordIdInt = Number.parseInt(exampleRecordId)
    const getStudentExampleRecordId = () => {
      const relatedStudentExample = studentExamplesTable.find(
        element => element.relatedExample === exampleRecordIdInt,
      )
      return relatedStudentExample?.recordId
    }
    const studentExampleRecordId = getStudentExampleRecordId()
    if (studentExampleRecordId && qbUserData.isAdmin) {
      try {
        const data = await deleteStudentExample(
          getAccessToken(),
          studentExampleRecordId,
        ).then((result) => {
          if (result === 1) {
            setBannerMessage('Flashcard removed!')
            updateExamplesTableQuietly()
          }
          else {
            setBannerMessage('Failed to remove flashcard')
          }
          return result
        })
        return data
      }
      catch (e) {
        console.error(e.message)
      }
    }
    else if (studentExampleRecordId && qbUserData.role === 'student') {
      try {
        const data = await deleteMyStudentExample(
          getAccessToken(),
          studentExampleRecordId,
        ).then((result) => {
          if (result === 1) {
            setBannerMessage('Flashcard removed!')
            updateExamplesTableQuietly()
          }
          else {
            setBannerMessage('Failed to remove flashcard')
          }
          return result
        })
        return data
      }
      catch (e) {
        console.error(e.message)
      }
    }
    else {
      setBannerMessage('Flashcard not found')
      return 0
    }
  }, [qbUserData, studentExamplesTable, getAccessToken, updateExamplesTableQuietly])

  const filterExamplesByAllowedVocab = useCallback((examples, lessonId) => {
    let allowedVocabulary = []
    programTable.forEach((program) => {
      const foundLesson = program.lessons.find(
        item => Number.parseInt(item.recordId) === lessonId,
      )
      if (foundLesson) {
        allowedVocabulary = foundLesson.vocabKnown || []
      }
      return allowedVocabulary
    })
    const filteredByAllowed = examples.filter((item) => {
      let isAllowed = true
      if (
        item.vocabIncluded.length === 0
        || item.vocabComplete === false
        || item.spanglish === 'spanglish'
      ) {
        isAllowed = false
      }
      item.vocabIncluded.forEach((word) => {
        if (!allowedVocabulary.includes(word)) {
          isAllowed = false
        }
      })
      return isAllowed
    })
    return filteredByAllowed
  }, [programTable])

  const setupAudioExamplesTable = useCallback(async () => {
    try {
      const data = await getAudioExamplesFromBackend(getAccessToken()).then(
        (result) => {
          setAudioExamplesTable(result)
        },
      )
      return data
    }
    catch (e) {
      console.error(e.message)
    }
  }, [getAccessToken])

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
    }
  }, [])

  useEffect(() => {
    if (rendered.current && isAuthenticated) {
      userSetup()
      parseCourseLessons()
    }
  }, [isAuthenticated, userSetup, parseCourseLessons])

  useEffect(() => {
    if (rendered.current && qbUserData?.isAdmin !== undefined) {
      if (qbUserData?.isAdmin || qbUserData?.role === ('student' || 'limited')) {
        setupAudioExamplesTable()
      }
      if (qbUserData?.role === 'student' || qbUserData?.role === 'limited') {
        setActiveStudent(qbUserData)
      }
      else {
        setFlashcardDataComplete(true)
      }
      if (qbUserData?.isAdmin) {
        async function setupStudentList() {
          const studentListPromise = await getStudentList()
          setStudentList(studentListPromise)
        }
        setupStudentList()
      }
    }
  }, [qbUserData, getStudentList, setupAudioExamplesTable])

  useEffect(() => {
    if (rendered.current && programTable.length > 0) {
      getStudentLevel()
      activeStudent?.recordId && updateExamplesTable()
    }
  }, [activeStudent, programTable, getStudentLevel, updateExamplesTable])

  useEffect(() => {
    flashcardDataComplete && setMenuReady(true)
    !flashcardDataComplete && setMenuReady(false)
  }, [flashcardDataComplete])

  useEffect(() => {
    clearTimeout(messageNumber.current)
    messageNumber.current = 0
    if (bannerMessage !== '') {
      const timeoutNumber = setTimeout(blankBanner, 1000)
      messageNumber.current = timeoutNumber
    }
  }, [bannerMessage, messageNumber, blankBanner])

  return (
    <div className="App" onClick={closeContextualIfClickOut}>
      <div className="div-header">
        <div className="homeButton" onClick={() => navigate('/')}>
          <img src={logo} alt="Learncraft Spanish Logo" />
        </div>
        <LogoutButton />
        <LoginButton />
      </div>
      {location.pathname !== '/coaching' && (
        <div className="div-user-subheader">
          {!isLoading && !isAuthenticated && (
            <p>You must be logged in to use this app.</p>
          )}
          {isAuthenticated && !menuReady && <p>Loading user data...</p>}
          {menuReady
          && (qbUserData.role === 'student' || qbUserData.role === 'limited')
          && !qbUserData.isAdmin && (
            <p>
              Welcome back,
              {` ${qbUserData.name}`}
              !
            </p>
          )}

          {isAuthenticated
          && menuReady
          && qbUserData.role !== 'student'
          && qbUserData.role !== 'limited'
          && !qbUserData.isAdmin && <p>Welcome back!</p>}

          {menuReady && qbUserData.isAdmin && !choosingStudent && (
            <div className="studentList">
              {activeStudent.recordId && (
                <p>
                  Using as
                  {' '}
                  {activeStudent.name}
                  {activeStudent.recordId === qbUserData.recordId
                  && ' (yourself)'}
                </p>
              )}
              {!activeStudent.recordId && <p>No student Selected</p>}
              <button type="button" onClick={chooseStudent}>Change</button>
            </div>
          )}
          {menuReady && qbUserData.isAdmin && choosingStudent && (
            <form className="studentList" onSubmit={e => e.preventDefault}>
              <select
                value={activeStudent ? activeStudent.recordId : {}}
                onChange={e => updateActiveStudent(e.target.value)}
              >
                {makeStudentSelector()}
              </select>
              <button type="button" onClick={keepStudent}>Cancel</button>
            </form>
          )}
        </div>
      )}

      {bannerMessage && (
        <div className="bannerMessage">
          <p>{bannerMessage}</p>
        </div>
      )}

      {menuReady && (
        <SentryRoutes>
          <Route
            exact
            path="/"
            element={(
              <Menu
                userData={qbUserData}
                updateExamplesTable={updateExamplesTable}
                examplesTable={examplesTable.current}
                studentExamplesTable={studentExamplesTable}
                activeStudent={activeStudent}
                flashcardDataComplete={flashcardDataComplete}
                audioExamplesTable={audioExamplesTable}
                filterExamplesByAllowedVocab={filterExamplesByAllowedVocab}
              />
            )}
          />
          <Route exact path="/callback" element={<CallbackPage />} />
          <Route
            exact
            path="/allflashcards"
            element={
              (qbUserData.role === 'student' || qbUserData.isAdmin) && (
                <SimpleQuizApp
                  updateExamplesTable={updateExamplesTable}
                  activeStudent={activeStudent}
                  examplesTable={examplesTable.current}
                  studentExamplesTable={studentExamplesTable}
                  removeFlashcard={removeFlashcardFromActiveStudent}
                />
              )
            }
          />
          <Route
            exact
            path="/todaysflashcards"
            element={
              (qbUserData.role === 'student' || qbUserData.isAdmin) && (
                <SRSQuizApp
                  flashcardDataComplete={flashcardDataComplete}
                  updateExamplesTable={updateExamplesTable}
                  activeStudent={activeStudent}
                  examplesTable={examplesTable.current}
                  studentExamplesTable={studentExamplesTable}
                  removeFlashcard={removeFlashcardFromActiveStudent}
                />
              )
            }
          />
          <Route
            exact
            path="/manage-flashcards"
            element={
              (qbUserData.role === 'student' || qbUserData.isAdmin) && (
                <FlashcardManager
                  examplesTable={examplesTable.current}
                  studentExamplesTable={studentExamplesTable}
                  activeStudent={qbUserData}
                  removeFlashcard={removeFlashcardFromActiveStudent}
                  updateExamplesTable={updateExamplesTable}
                />
              )
            }
          />
          <Route
            path="/officialquizzes/*"
            element={(
              <LCSPQuizApp
                getAccessToken={getAccessToken}
                updateExamplesTable={updateExamplesTableQuietly}
                studentExamples={studentExamplesTable}
                activeStudent={activeStudent}
                selectedProgram={selectedProgram}
                selectedLesson={selectedLesson}
                addFlashcard={addToActiveStudentFlashcards}
                removeFlashcard={removeFlashcardFromActiveStudent}
              />
            )}
          />
          <Route
            exact
            path="/flashcardfinder"
            element={
              (qbUserData.role === 'student'
              || qbUserData.role === 'limited'
              || qbUserData.isAdmin) && (
                <FlashcardFinder
                  user={qbUserData || {}}
                  activeStudent={activeStudent}
                  programTable={programTable}
                  getAccessToken={getAccessToken}
                  studentList={studentList}
                  studentExamplesTable={studentExamplesTable}
                  updateBannerMessage={updateBannerMessage}
                  addFlashcard={addToActiveStudentFlashcards} // PROBLEM: Duplicate Reference
                  updateExamplesTable={updateExamplesTable}
                  flashcardDataComplete={flashcardDataComplete}
                  addToActiveStudentFlashcards={addToActiveStudentFlashcards} // PROBLEM: Duplicate Reference
                  selectedLesson={selectedLesson}
                  selectedProgram={selectedProgram}
                  updateSelectedLesson={updateSelectedLesson}
                  updateSelectedProgram={updateSelectedProgram}
                  contextual={contextual}
                  openContextual={openContextual}
                  closeContextual={closeContextual}
                  ref={currentContextual}
                />
              )
            }
          />
          <Route
            exact
            path="/audioquiz"
            element={
              (qbUserData.role === 'student'
              || qbUserData.role === 'limited'
              || qbUserData.isAdmin) && (
                <AudioQuiz
                  activeStudent={activeStudent}
                  programTable={programTable}
                  studentExamplesTable={studentExamplesTable}
                  updateBannerMessage={updateBannerMessage}
                  audioExamplesTable={audioExamplesTable}
                  filterExamplesByAllowedVocab={filterExamplesByAllowedVocab}
                  selectedLesson={selectedLesson}
                  selectedProgram={selectedProgram}
                  updateSelectedLesson={updateSelectedLesson}
                  updateSelectedProgram={updateSelectedProgram}
                />
              )
            }
          />
          <Route
            exact
            path="/comprehensionquiz"
            element={
              (qbUserData.role === 'student'
              || qbUserData.role === 'limited'
              || qbUserData.isAdmin) && (
                <ComprehensionQuiz
                  activeStudent={activeStudent}
                  programTable={programTable}
                  studentExamplesTable={studentExamplesTable}
                  updateBannerMessage={updateBannerMessage}
                  audioExamplesTable={audioExamplesTable}
                  filterExamplesByAllowedVocab={filterExamplesByAllowedVocab}
                  selectedLesson={selectedLesson}
                  selectedProgram={selectedProgram}
                  updateSelectedLesson={updateSelectedLesson}
                  updateSelectedProgram={updateSelectedProgram}
                />
              )
            }
          />
          <Route
            exact
            path="/frequensay"
            element={
              qbUserData.isAdmin && (
                <FrequenSay
                  activeStudent={activeStudent}
                  programTable={programTable}
                  selectedLesson={selectedLesson}
                  selectedProgram={selectedProgram}
                  updateSelectedLesson={updateSelectedLesson}
                  updateSelectedProgram={updateSelectedProgram}
                />
              )
            }
          />
          <Route
            exact
            path="/coaching"
            element={
              qbUserData.isAdmin && (
                <Coaching
                  userData={qbUserData}
                  contextual={contextual}
                  openContextual={openContextual}
                  closeContextual={closeContextual}
                  ref={currentContextual}
                />
              )
            }
          />
          <Route path="/*" element={<NotFoundPage />} />
        </SentryRoutes>
      )}
    </div>
  )
}

export default App
