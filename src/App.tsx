import './App.css'
import type { ReactElement } from 'react'
import React, { isValidElement, useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Route, useLocation, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import { useUserData } from './hooks/useUserData'
import { useActiveStudent } from './hooks/useActiveStudent'
import type { Flashcard, Lesson, Program, UserData } from './interfaceDefinitions'
import SentryRoutes from './functions/SentryRoutes'
import logo from './resources/typelogosmall.png'
import Menu from './Menu'
import AudioQuiz from './AudioQuiz'
import LoginButton from './components/LoginButton'
import LogoutButton from './components/LogoutButton'
import LCSPQuizApp from './LCSPQuizApp'
import FrequenSay from './FrequenSay'
import NotFoundPage from './NotFoundPage'
import ComprehensionQuiz from './ComprehensionQuiz'
import FlashcardFinder from './FlashcardFinder'
import CallbackPage from './CallbackPage'
import FlashcardManager from './FlashcardManager'
import ReviewMyFlashcards from './ReviewMyFlashcards'

export const App: React.FC = () => {
  // React Router hooks
  const location = useLocation()
  const navigate = useNavigate()
  const userDataQuery = useUserData()
  const { activeStudent, activeLesson, activeProgram, choosingStudent, programsQuery, studentListQuery, chooseStudent, keepStudent, updateActiveStudent } = useActiveStudent()
  const { isAuthenticated, isLoading } = useAuth0()

  // States for Lesson Selector
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

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
  const updateSelectedLesson = useCallback((lessonId: number | string) => {
    if (typeof lessonId === 'string') {
      lessonId = Number.parseInt(lessonId)
    }
    let newLesson = null
    programsQuery.data?.forEach((program) => {
      const foundLesson = program.lessons.find(item => item.recordId === lessonId)
      if (foundLesson) {
        newLesson = foundLesson
      }
    })
    setSelectedLesson(newLesson)
  }, [programsQuery?.data])

  const updateSelectedProgram = useCallback((programId: number | string) => {
    if (typeof programId === 'string') {
      programId = Number.parseInt(programId)
    }
    let newProgram = null
    newProgram = programsQuery.data?.find(program => program.recordId === programId)
    if (newProgram) {
      setSelectedProgram(newProgram)
    }
    else {
      setSelectedProgram(null)
    }
  }, [programsQuery?.data])// Add activeProgram, activeLesson when defined

  const updateBannerMessage = useCallback((message: string) => {
    setBannerMessage(message)
  }, [])

  const blankBanner = useCallback(() => {
    setBannerMessage('')
  }, [])

  const makeStudentSelector = useCallback(() => {
    if (userDataQuery.data?.isAdmin) {
      const studentSelector = [
        <option key={0} label="">
          {' '}
          -- None Selected --
        </option>,
      ]
      studentListQuery.data?.forEach((student: UserData) => {
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
  }, [userDataQuery.data?.isAdmin, studentListQuery.data])

  const filterExamplesByAllowedVocab = useCallback((examples: Flashcard[], lessonId: number) => {
    let allowedVocabulary: string[] = []
    programsQuery.data?.forEach((program) => {
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
  }, [programsQuery?.data])

  useEffect(() => {
    // change the selected lesson when the selected program changes
    const hasActiveLesson = activeLesson?.current?.recordId
    const activeProgramSelected = selectedProgram?.recordId === activeProgram?.current?.recordId

    // default to active lesson if present, otherwise first lesson
    if (hasActiveLesson && activeProgramSelected) {
      updateSelectedLesson(activeLesson.current!.recordId)
    }
    else if (selectedProgram?.lessons?.length) {
      updateSelectedLesson(selectedProgram.lessons[0].recordId)
    }
  }, [activeStudent, activeLesson, activeProgram, selectedProgram, programsQuery?.data, updateSelectedLesson])

  useEffect(() => {
    // renders twice if student has an active program
    if (activeProgram?.current) {
      updateSelectedProgram(activeProgram.current.recordId)
    }
    // Setting Default Vaules for selectedProgram and selectedLesson
    else if (programsQuery?.data?.length) {
      updateSelectedProgram(programsQuery.data[0].recordId)
    }
  }, [activeProgram, activeStudent, programsQuery?.data, updateSelectedProgram])

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
          {isLoading && <p>Logging In...</p>}
          {!isLoading && isAuthenticated && userDataQuery.isLoading && <p>Loading user data...</p>}
          {!isLoading && isAuthenticated && userDataQuery.isError && <p>Error loading user data.</p>}
          {!isLoading && isAuthenticated && userDataQuery.isSuccess
          && (userDataQuery.data?.role === 'student' || userDataQuery.data?.role === 'limited')
          && !userDataQuery.data?.isAdmin && (
            <p>
              Welcome back,
              {` ${userDataQuery.data.name}`}
              !
            </p>
          )}

          {!isLoading && isAuthenticated && userDataQuery.isSuccess && userDataQuery.data?.role !== 'student'
          && userDataQuery.data?.role !== 'limited'
          && !userDataQuery.data?.isAdmin && <p>Welcome back!</p>}

          {userDataQuery.data?.isAdmin && !choosingStudent && (
            <div className="studentList">
              {activeStudent?.recordId && (
                <p>
                  Using as
                  {' '}
                  {activeStudent.name}
                  {activeStudent.recordId === userDataQuery.data?.recordId
                  && ' (yourself)'}
                </p>
              )}
              {!activeStudent?.recordId && <p>No student Selected</p>}
              <button type="button" onClick={chooseStudent}>Change</button>
            </div>
          )}
          {userDataQuery.data?.isAdmin && choosingStudent && (
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
            <Menu />
          )}
        />
        <Route path="/callback" element={<CallbackPage />} />
        <Route
          path="/myflashcards/*"
          element={
            (activeStudent?.role === 'student')
            && <ReviewMyFlashcards />
          }
        />
        {/* <Route
          path="/allflashcards"
          element={
            (activeStudent?.role === 'student' && studentFlashcardData?.studentExamples?.length)
              ? (
                  <Quiz
                    examplesToParse={studentFlashcardData?.examples}
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
              ? <SRSQuizApp />
              : <Navigate to="/" />
          }
        /> */}
        <Route
          path="/manage-flashcards"
          element={<FlashcardManager />}
        />
        (
        <Route
          path="/officialquizzes/*"
          element={(
            <LCSPQuizApp
              selectedProgram={selectedProgram}
              selectedLesson={selectedLesson}
            />
          )}
        />
        )
        <Route
          path="/flashcardfinder"
          element={
            (userDataQuery.data?.role === 'student' || userDataQuery.data?.isAdmin) && (
              <FlashcardFinder
                selectedLesson={selectedLesson}
                selectedProgram={selectedProgram}
                updateSelectedLesson={updateSelectedLesson}
                updateSelectedProgram={updateSelectedProgram}
                contextual={contextual}
                openContextual={openContextual}
                ref={currentContextual}
              />
            )
          }
        />
        <Route
          path="/audioquiz"
          element={
            (userDataQuery.data?.role === 'student'
            || userDataQuery.data?.role === 'limited'
            || userDataQuery.data?.isAdmin) && (
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
            (userDataQuery.data?.role === 'student'
            || userDataQuery.data?.role === 'limited'
            || userDataQuery.data?.isAdmin) && (
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
            userDataQuery.data?.isAdmin && (
              <FrequenSay
                selectedLesson={selectedLesson}
                selectedProgram={selectedProgram}
                updateSelectedLesson={updateSelectedLesson}
                updateSelectedProgram={updateSelectedProgram}
              />
            )
          }
        />
        {// Coaching Section still under construction
        /*
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
        */}
        <Route path="/*" element={<NotFoundPage />} />
      </SentryRoutes>
    </div>
  )
}

export default App
