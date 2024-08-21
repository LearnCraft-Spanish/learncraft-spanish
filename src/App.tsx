import './App.css'
import type { ReactNode } from 'react'
import React, { isValidElement, useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Route, useLocation, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import { useUserData } from './hooks/useUserData'
import { useActiveStudent } from './hooks/useActiveStudent'
import { useBackend } from './hooks/useBackend'
import type { Flashcard, Lesson, Program } from './interfaceDefinitions'
import logo from './resources/typelogosmall.png'
import Menu from './Menu'
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
import Quiz from './components/Quiz'

interface AppProps {
  SentryRoutes: ReactNode
}

export const App: React.FC<AppProps> = ({ SentryRoutes }) => {
  // initialize and destructure Auth0 hook and define audience
  const { isAuthenticated, isLoading } = useAuth0()
  const {
    getAllUsersFromBackend,
    getAudioExamplesFromBackend,
  } = useBackend()

  // React Router hooks
  const location = useLocation()
  const navigate = useNavigate()
  const { userData } = useUserData()
  const { activeStudent, studentFlashcardData, choosingStudent, flashcardDataSynced } = useActiveStudent()

  // States for Lesson Selector
  const [selectedLesson, setSelectedLesson] = useState<Lesson>()
  const [selectedProgram, setSelectedProgram] = useState<Program>()

  // States for banner message
  const [bannerMessage, setBannerMessage] = useState('')
  const messageNumber = useRef(0)

  // Reference to the current contextual menu element
  const currentContextual = useRef<HTMLDivElement | null >(null)
  const [contextual, setContextual] = useState('') // String to indicate which contextual menu is open

  // global functions to open and close any contextual menus – hard limit to one at a time
  const openContextual = useCallback((elementClass: string) => {
    setContextual(elementClass)
  }, [])

  const closeContextual = useCallback(() => {
    setContextual('')
  }, [])

  // local function to close contextual menu if click is outside of it
  function closeContextualIfClickOut(e: MouseEvent) {
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
  const updateSelectedLesson = useCallback((lessonId: number) => {
    let newLesson
    programTable.forEach((program) => {
      const foundLesson = program.lessons.find(
        item => item.recordId === lessonId,
      )
      if (foundLesson) {
        newLesson = foundLesson
      }
    })
    setSelectedLesson(newLesson)
  }, [programTable])

  const updateSelectedProgram = useCallback((programId: number) => {
    const programIdNumber = programId
    const newProgram
      = programTable.find(program => program.recordId === programIdNumber)
      || (/* activeProgram.current.recordId
        ? activeProgram.current
        : */programTable.find(program => program.recordId === 2)) // Active program not currently defined
    setSelectedProgram(newProgram)
    if (newProgram) {
    /* if (
      activeLesson.current.recordId
      && newProgram?.recordId === activeProgram.current.recordId
    ) {
      const lessonToSelect = activeLesson.current.recordId
      updateSelectedLesson(lessonToSelect)
    }
    else { */
      const firstLesson = newProgram.lessons[0]
      const lessonToSelect = firstLesson.recordId
      updateSelectedLesson(lessonToSelect)
    // }
    }
  }, [programTable, updateSelectedLesson])// Add activeProgram, activeLesson when defined

  const updateBannerMessage = useCallback((message: string) => {
    setBannerMessage(message)
  }, [])

  const blankBanner = useCallback(() => {
    setBannerMessage('')
  }, [])

  const makeStudentSelector = useCallback(() => {
    if (userData.isAdmin) {
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
  }, [userData, studentList])

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
      const data = await getAudioExamplesFromBackend().then(
        (result) => {
          setAudioExamplesTable(result)
        },
      )
      return data
    }
    catch (e) {
      console.error(e.message)
    }
  }, [getAudioExamplesFromBackend])

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
    }
  }, [])

  useEffect(() => {
    if (rendered.current && isAuthenticated) {
      parseCourseLessons()
    }
  }, [isAuthenticated, parseCourseLessons])

  useEffect(() => {
    if (rendered.current && userData?.isAdmin !== undefined) {
      if (userData?.isAdmin || userData?.role === ('student' || 'limited')) {
        setupAudioExamplesTable()
      }
      if (userData?.role === 'student' || userData?.role === 'limited') {
        setActiveStudent(userData)
      }
      else {
        if (flashcardDataCompleteQueue.current === 0) {
          setFlashcardDataComplete(true)
        }
      }
    }
  }, [userData, getAllUsersFromBackend, setupAudioExamplesTable, setActiveStudent])

  useEffect(() => {
    if (rendered.current && programTable.length > 0) {
      getStudentLevel()
      activeStudent?.recordId && updateExamplesTable()
    }
  }, [activeStudent, programTable, getStudentLevel, updateExamplesTable])

  useEffect(() => {
    if (!appsLoadable && flashcardDataComplete) {
      setAppsloadable(true)
    }
  }, [flashcardDataComplete, appsLoadable])

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
          {isAuthenticated && <p>Loading user data...</p>}
          {
            (userData?.role === 'student' || userData?.role === 'limited')
            && !userData.isAdmin && (
              <p>
                Welcome back,
                {` ${userData.name}`}
                !
              </p>
            )
          }

          {isAuthenticated
          && userData?.role !== 'student'
          && userData?.role !== 'limited'
          && !userData?.isAdmin && <p>Welcome back!</p>}

          {userData?.isAdmin && !choosingStudent && (
            <div className="studentList">
              {activeStudent?.recordId && (
                <p>
                  Using as
                  {' '}
                  {activeStudent.name}
                  {activeStudent.recordId === userData.recordId
                  && ' (yourself)'}
                </p>
              )}
              {!activeStudent?.recordId && <p>No student Selected</p>}
              <button type="button" onClick={chooseStudent}>Change</button>
            </div>
          )}
          {userData?.isAdmin && choosingStudent && (
            <form className="studentList" onSubmit={e => e.preventDefault}>
              <select
                value={activeStudent ? activeStudent.recordId : undefined}
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

      {(
        <SentryRoutes>
          <Route
            exact
            path="/"
            element={(
              <Menu
                examplesTable={examplesTable.current}
                flashcardDataComplete={flashcardDataComplete}
                audioExamplesTable={audioExamplesTable}
                filterExamplesByAllowedVocab={filterExamplesByAllowedVocab}
                queueCount={flashcardDataCompleteQueue.current}
              />
            )}
          />
          <Route exact path="/callback" element={<CallbackPage />} />
          <Route
            exact
            path="/allflashcards"
            element={
              (activeStudent?.role === 'student' && studentFlashcardData?.studentExamples?.length > 0)
                ? (
                    <Quiz
                      examplesToParse={examplesTable.current}
                      quizTitle="My Flashcards"
                      quizOnlyCollectedExamples
                      addFlashcard={addToActiveStudentFlashcards}
                      makeMenuShow={() => navigate('..')}
                      removeFlashcard={removeFlashcardFromActiveStudent}
                    />
                  )
                : (<Navigate to="/" />)
            }
          />

          <Route
            exact
            path="/todaysflashcards"
            element={
              (activeStudent?.role === 'student' && studentExamplesTable.length > 0)
                ? (
                    <SRSQuizApp
                      flashcardDataComplete={flashcardDataComplete}
                      examplesTable={examplesTable.current}
                      removeFlashcard={removeFlashcardFromActiveStudent}
                    />
                  )
                : (<Navigate to="/" />)
            }
          />
          <Route
            exact
            path="/manage-flashcards"
            element={
              (activeStudent?.role === 'student' && studentExamplesTable.length > 0)
                ? (
                    <FlashcardManager
                      examplesTable={examplesTable.current}
                      flashcardDataComplete={flashcardDataComplete}
                      removeFlashcard={removeFlashcardFromActiveStudent}
                    />
                  )
                : (<Navigate to="/" />)
            }
          />
          <Route
            path="/officialquizzes/*"
            element={(
              <LCSPQuizApp
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
              (userData.role === 'student'
              || userData.role === 'limited'
              || userData.isAdmin) && (
                <FlashcardFinder
                  user={userData || {}}
                  programTable={programTable}
                  studentExamplesTable={studentExamplesTable}
                  updateBannerMessage={updateBannerMessage}
                  addFlashcard={addToActiveStudentFlashcards} // PROBLEM: Duplicate Reference
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
              (userData.role === 'student'
              || userData.role === 'limited'
              || userData.isAdmin) && (
                <AudioQuiz
                  programTable={programTable}
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
              (userData.role === 'student'
              || userData.role === 'limited'
              || userData.isAdmin) && (
                <ComprehensionQuiz
                  programTable={programTable}
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
              userData.isAdmin && (
                <FrequenSay
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
              userData.isAdmin && (
                <Coaching
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
