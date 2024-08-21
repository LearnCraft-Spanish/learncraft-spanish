import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import debounce from 'lodash/debounce'
import type { Flashcard, StudentExample, StudentFlashcardData, UserData } from '../interfaceDefinitions' // Adjust the import based on your project structure
import { useBackend } from '../hooks/useBackend'
import { useUserData } from '../hooks/useUserData'

interface ActiveStudentContextProps {
  activeStudent: UserData | null
  setActiveStudent: (student: UserData | null) => void
  studentFlashcardData: StudentFlashcardData | null
  choosingStudent: boolean
  chooseStudent: () => void
  keepStudent: () => void
  studentList: UserData[]
  updateActiveStudent: (studentID: number) => void
  flashcardDataSynced: boolean
  syncFlashcards: () => void
}

const ActiveStudentContext = createContext<ActiveStudentContextProps | undefined>(undefined)

interface ActiveStudentProviderProps {
  children: ReactNode
}

export function ActiveStudentProvider({ children }: ActiveStudentProviderProps) {
  const { userData } = useUserData()
  const { getAllUsersFromBackend, getActiveExamplesFromBackend, getMyExamplesFromBackend } = useBackend()

  // UserData object of the active student
  const [activeStudent, setActiveStudent] = useState<UserData | null>(null)

  // If admin, can change the active student from list
  const [studentList, setStudentList] = useState<UserData[]>([])
  const [choosingStudent, setChoosingStudent] = useState(false)

  // Flashcard data, recently restructured as an object with two arrays as traits
  const [studentFlashcardData, setStudentFlashcardData] = useState<StudentFlashcardData | null>(null)

  // Whether the state is up to date with the actual database
  const [flashcardDataSynced, setFlashcardDataSynced] = useState(false)

  // Increments to reject stale data
  const syncNumber = useRef(0)

  const setupStudentList = useCallback(async () => {
    getAllUsersFromBackend()
      .then((response) => {
        if (response)
          setStudentList(response)
      })
  }, [getAllUsersFromBackend])

  function chooseStudent() {
    setChoosingStudent(true)
  }

  function keepStudent() {
    setChoosingStudent(false)
  }

  const updateActiveStudent = useCallback((studentID: number) => {
    const newStudent = studentList.find(student => student.recordId === studentID)
    if (newStudent) {
      setActiveStudent(newStudent)
      setChoosingStudent(false)
    }
  }, [studentList, setActiveStudent])

  const syncFlashcards = useCallback(async () => {
    syncNumber.current++
    const thisSyncNumber = syncNumber.current
    if (activeStudent?.recordId) {
      const dataPromise = userData?.isAdmin ? getActiveExamplesFromBackend(activeStudent?.recordId) : getMyExamplesFromBackend()
      dataPromise
        .then((response) => {
          if (thisSyncNumber === syncNumber.current) {
            if (response?.examples && response?.studentExamples) {
              setStudentFlashcardData(response)
            }
            setFlashcardDataSynced(true)
            syncNumber.current = 0
          }
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }, [activeStudent, userData?.isAdmin, getActiveExamplesFromBackend, getMyExamplesFromBackend])

  const value = useMemo(
    () => ({ activeStudent, setActiveStudent, studentFlashcardData, choosingStudent, chooseStudent, keepStudent, studentList, updateActiveStudent, flashcardDataSynced, syncFlashcards }),
    [activeStudent, studentFlashcardData, choosingStudent, studentList, updateActiveStudent, flashcardDataSynced, syncFlashcards],
  )

  useEffect(() => {
    if (userData?.isAdmin) {
      setupStudentList()
    }
  }, [userData?.isAdmin, setupStudentList])

  useEffect(() => {
    if (activeStudent?.recordId) {
      setFlashcardDataSynced(false)
      debounce(syncFlashcards, 500)
    }
  }, [studentFlashcardData?.examples, studentFlashcardData?.studentExamples, activeStudent, syncFlashcards])

  return (
    <ActiveStudentContext.Provider value={value}>
      {children}
    </ActiveStudentContext.Provider>
  )
}

export default ActiveStudentContext
