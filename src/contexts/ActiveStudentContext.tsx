import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Flashcard, StudentExample, StudentFlashcardData, UserData } from '../interfaceDefinitions' // Adjust the import based on your project structure
import { useBackend } from '../hooks/useBackend'
import { useUserData } from '../hooks/useUserData'

interface ActiveStudentContextProps {
  activeStudent: UserData | null
  setActiveStudent: (student: UserData | null) => void
  studentFlashcardData: StudentFlashcardData | null
  setStudentFlashcardData: (examples: StudentExample[]) => void
  choosingStudent: boolean
  chooseStudent: () => void
  keepStudent: () => void
  studentList: UserData[]
  updateActiveStudent: (studentID: number) => void
  flashcardDataSynced: boolean
}

const ActiveStudentContext = createContext<ActiveStudentContextProps | undefined>(undefined)

interface ActiveStudentProviderProps {
  children: ReactNode
}

export function ActiveStudentProvider({ children }: ActiveStudentProviderProps) {
  const { userData } = useUserData()
  const { getAllUsersFromBackend, getActiveExamplesFromBackend, getMyExamplesFromBackend } = useBackend()
  const [activeStudent, setActiveStudent] = useState<UserData | null>(null)
  const [studentList, setStudentList] = useState<UserData[]>([])
  const [choosingStudent, setChoosingStudent] = useState(false)

  const [studentFlashcardData, setStudentFlashcardData] = useState<StudentFlashcardData | null>(null)
  const [flashcardDataSynced, setFlashcardDataSynced] = useState(false)
  const syncNumber = useRef(0)
  const latestSync = useRef <Promise <boolean> | null>(null)

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
    () => ({ activeStudent, setActiveStudent, studentFlashcardData, setStudentFlashcardData, choosingStudent, chooseStudent, keepStudent, studentList, updateActiveStudent, flashcardDataSynced }),
    [activeStudent, studentFlashcardData, choosingStudent, studentList, updateActiveStudent],
  )

  useEffect(() => {
    if (userData?.isAdmin) {
      setupStudentList()
    }
  }, [userData?.isAdmin, setupStudentList])

  useEffect(() => {
    if (activeStudent?.recordId) {
      setFlashcardDataSynced(false)
    }
  }, [studentFlashcardData?.examples, studentFlashcardData?.studentExamples, activeStudent])

  return (
    <ActiveStudentContext.Provider value={value}>
      {children}
    </ActiveStudentContext.Provider>
  )
}

export default ActiveStudentContext
