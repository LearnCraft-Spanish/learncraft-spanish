import './App.css'
import type { ReactElement } from 'react'
import React, { isValidElement, useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Route, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import { ac } from 'vitest/dist/chunks/reporters.C_zwCd4j'
import { useUserData } from './hooks/useUserData'
import { useActiveStudent } from './hooks/useActiveStudent'
import { useProgramTable } from './hooks/useProgramTable'
import type { Lesson, Program, UserData } from './interfaceDefinitions'
import SentryRoutes from './functions/SentryRoutes'
import Menu from './Menu'
import LCSPQuizApp from './LCSPQuizApp'
import FrequenSay from './FrequenSay'
import NotFoundPage from './NotFoundPage'
import FlashcardFinder from './FlashcardFinder'
import CallbackPage from './CallbackPage'
import FlashcardManager from './FlashcardManager'
import ReviewMyFlashcards from './ReviewMyFlashcards'
import AudioBasedReview from './components/AudioBasedReview/AudioBasedReview'
import Nav from './components/Nav'

export const App: React.FC = () => {
  // React Router hooks
  const location = useLocation()
  const userDataQuery = useUserData()
  const { activeStudentQuery, activeLesson, studentListQuery, activeProgram, chooseStudent } = useActiveStudent()
  const { programTableQuery } = useProgramTable()
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

  // Boolean state to determine whether to show the student selector menu
  const [studentSelectorOpen, setStudentSelectorOpen] = useState(false)

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
    programTableQuery.data?.forEach((program) => {
      const foundLesson = program.lessons.find(item => item.recordId === lessonId)
      if (foundLesson) {
        newLesson = foundLesson
      }
    })
    setSelectedLesson(newLesson)
  }, [programTableQuery?.data])

  const updateSelectedProgram = useCallback((programId: number | string) => {
    if (typeof programId === 'string') {
      programId = Number.parseInt(programId)
    }
    let newProgram = null
    newProgram = programTableQuery.data?.find(program => program.recordId === programId)
    if (newProgram) {
      setSelectedProgram(newProgram)
    }
    else {
      setSelectedProgram(null)
    }
  }, [programTableQuery?.data])// Add activeProgram, activeLesson when defined

  const _updateBannerMessage = useCallback((message: string) => {
    setBannerMessage(message)
  }, [])

  const blankBanner = useCallback(() => {
    setBannerMessage('')
  }, [])

  const makeStudentSelector = useCallback(() => {
    if (userDataQuery.data?.isAdmin && studentListQuery.isSuccess) {
      const studentSelector = [
        <option key={0} label="">
          -- None Selected --
        </option>,
      ]
      studentListQuery.data.forEach((student: UserData) => {
        const studentEmail = student.emailAddress
        const studentRole = student.role
        if (!studentEmail.includes('(') && (studentRole === 'student' || studentRole === 'limited')) {
          studentSelector.push(
            <option
              key={student.recordId}
              value={student.recordId}
              label={`${student.name} -- ${student.emailAddress}`}
            />,
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
  }, [userDataQuery.data?.isAdmin, studentListQuery.isSuccess, studentListQuery.data])

  const openStudentSelector = useCallback(() => {
    setStudentSelectorOpen(true)
  }, [])

  const closeStudentSelector = useCallback(() => {
    setStudentSelectorOpen(false)
  }, [])

  useEffect(() => {
    // change the selected lesson when the selected program changes
    const hasActiveLesson = activeLesson?.recordId
    const activeProgramSelected = selectedProgram?.recordId === activeProgram?.recordId

    // default to active lesson if present, otherwise first lesson
    if (hasActiveLesson && activeProgramSelected) {
      updateSelectedLesson(activeLesson.recordId)
    }
    else if (selectedProgram?.lessons?.length) {
      updateSelectedLesson(selectedProgram.lessons[0].recordId)
    }
  }, [activeStudentQuery.data, activeLesson, activeProgram, selectedProgram, programTableQuery?.data, updateSelectedLesson])

  useEffect(() => {
    // renders twice if student has an active program
    if (activeProgram?.recordId) {
      updateSelectedProgram(activeProgram.recordId)
    }
    // Setting Default Vaules for selectedProgram and selectedLesson
    else if (programTableQuery.data?.length) {
      updateSelectedProgram(programTableQuery.data[0].recordId)
    }
  }, [activeProgram, activeStudentQuery.data, programTableQuery.data, updateSelectedProgram])

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
      <Nav />
      {(location.pathname !== '/coaching'
      && location.pathname !== '/comprehensionquiz'
      && location.pathname !== '/audioquiz'
      && location.pathname !== '/myflashcards/quiz'
      && location.pathname !== '/myflashcards/srsquiz'
      && location.pathname.split('/')[1] !== 'officialquizzes') && (
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

          {userDataQuery.data?.isAdmin && !studentSelectorOpen && (
            <div className="studentList">
              {activeStudentQuery.data?.recordId && (
                <p>
                  Using as
                  {' '}
                  {activeStudentQuery.data?.name}
                  {activeStudentQuery.data?.recordId === userDataQuery.data?.recordId
                  && ' (yourself)'}
                </p>
              )}
              {!activeStudentQuery.data?.recordId && <p>No student Selected</p>}
              <button type="button" onClick={openStudentSelector}>Change</button>
            </div>
          )}
          {userDataQuery.data?.isAdmin && studentSelectorOpen && (
            <form className="studentList" onSubmit={e => e.preventDefault}>
              <select
                value={activeStudentQuery.data ? activeStudentQuery.data?.recordId : undefined}
                onChange={e => chooseStudent(Number.parseInt(e.target.value))}
              >
                {makeStudentSelector()}
              </select>
              <button type="button" onClick={closeStudentSelector}>Cancel</button>
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
          element={<ReviewMyFlashcards />}
        />
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
          path="/audioquiz/*"
          element={
            (userDataQuery.data?.role === 'student'
            || userDataQuery.data?.role === 'limited'
            || userDataQuery.data?.isAdmin) && (
              <AudioBasedReview
                selectedLesson={selectedLesson}
                selectedProgram={selectedProgram}
                updateSelectedLesson={updateSelectedLesson}
                updateSelectedProgram={updateSelectedProgram}
                audioOrComprehension="audio"
                willAutoplay
              />
            )
          }
        />
        <Route
          path="/comprehensionquiz/*"
          element={
            (userDataQuery.data?.role === 'student'
            || userDataQuery.data?.role === 'limited'
            || userDataQuery.data?.isAdmin) && (
              <AudioBasedReview
                selectedLesson={selectedLesson}
                selectedProgram={selectedProgram}
                updateSelectedLesson={updateSelectedLesson}
                updateSelectedProgram={updateSelectedProgram}
                audioOrComprehension="comprehension"
                willAutoplay={false}
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
