import './App.css'
import type { ReactElement } from 'react'
import React, { isValidElement, useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Route, useLocation, useNavigate } from 'react-router-dom'

import { useUserData } from './hooks/useUserData'
import { useActiveStudent } from './hooks/useActiveStudent'
import type { Flashcard, Lesson, Program, UserData } from './interfaceDefinitions'
import SentryRoutes from './functions/SentryRoutes'
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

export const App: React.FC = () => {
  // React Router hooks
  const location = useLocation()
  const navigate = useNavigate()
  const { userData } = useUserData()
  const { activeStudent, studentFlashcardData, choosingStudent, programTable, studentList, chooseStudent, keepStudent, updateActiveStudent } = useActiveStudent()

  // States for Lesson Selector
  const [selectedLesson, setSelectedLesson] = useState<Lesson>()
  const [selectedProgram, setSelectedProgram] = useState<Program>()

  // States for banner message
  const [bannerMessage, setBannerMessage] = useState('')
  const messageNumber = useRef<number | NodeJS.Timeout>(0)

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
  function closeContextualIfClickOut(e: React.MouseEvent) {
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
    if (userData?.isAdmin) {
      const studentSelector = [
        <option key={0} label="">
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
              value={student.recordId}
              label={student.name}
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
      const studentSelectorSortFunction = (a: ReactElement, b: ReactElement) => {
        const aName = a.props.label
        const bName = b.props.label
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

  const filterExamplesByAllowedVocab = useCallback((examples: Flashcard[], lessonId: number) => {
    let allowedVocabulary: string[] = []
    programTable.forEach((program) => {
      const foundLesson = program.lessons.find(
        item => item.recordId === lessonId,
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
          {!userData && (
            <p>You must be logged in to use this app.</p>
          )}
          {!userData && <p>Loading user data...</p>}
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

          {userData?.role !== 'student'
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
                onChange={e => updateActiveStudent(Number.parseInt(e.target.value))}
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
      <SentryRoutes>
        <Route
          path="/"
          element={(
            <Menu
              filterExamplesByAllowedVocab={filterExamplesByAllowedVocab}
            />
          )}
        />
        <Route path="/callback" element={<CallbackPage />} />
        <Route
          path="/allflashcards"
          element={
            (activeStudent?.role === 'student' && studentFlashcardData?.studentExamples?.length)
              ? (
                  <Quiz
                    quizTitle="My Flashcards"
                    quizOnlyCollectedExamples
                    cleanupFunction={() => navigate('..')}
                  />
                )
              : (<Navigate to="/" />)
          }
        />

        <Route
          path="/todaysflashcards"
          element={
            (activeStudent?.role === 'student' && studentFlashcardData?.studentExamples.length)
              ? (
                  <SRSQuizApp
                    examplesTable={studentFlashcardData?.examples}
                  />
                )
              : (<Navigate to="/" />)
          }
        />
        <Route
          path="/manage-flashcards"
          element={
            (activeStudent?.role === 'student' && studentFlashcardData?.examples.length)
              ? <FlashcardManager />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/officialquizzes/*"
          element={(
            <LCSPQuizApp
              selectedProgram={selectedProgram}
              selectedLesson={selectedLesson}
            />
          )}
        />
        <Route
          path="/flashcardfinder"
          element={
            (userData?.role === 'student' || userData?.isAdmin) && (
              <FlashcardFinder
                updateBannerMessage={updateBannerMessage}
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
          path="/audioquiz"
          element={
            (userData?.role === 'student'
            || userData?.role === 'limited'
            || userData?.isAdmin) && (
              <AudioQuiz
                updateBannerMessage={updateBannerMessage}
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
          path="/comprehensionquiz"
          element={
            (userData?.role === 'student'
            || userData?.role === 'limited'
            || userData?.isAdmin) && (
              <ComprehensionQuiz
                updateBannerMessage={updateBannerMessage}
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
          path="/frequensay"
          element={
            userData?.isAdmin && (
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
          path="/coaching"
          element={
            userData?.isAdmin && (
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
    </div>
  )
}

export default App
