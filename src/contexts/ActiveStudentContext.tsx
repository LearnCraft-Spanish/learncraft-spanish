import React, { createContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { StudentExample, UserData } from '../interfaceDefinitions' // Adjust the import based on your project structure

interface ActiveStudentContextProps {
  activeStudent: UserData | null
  setActiveStudent: (student: UserData | null) => void
  studentExamplesTable: StudentExample[]
  setStudentExamplesTable: (examples: StudentExample[]) => void
}

const ActiveStudentContext = createContext<ActiveStudentContextProps | undefined>(undefined)

interface ActiveStudentProviderProps {
  children: ReactNode
}

export function ActiveStudentProvider({ children }: ActiveStudentProviderProps) {
  const [activeStudent, setActiveStudent] = useState<UserData | null>(null)
  const [studentExamplesTable, setStudentExamplesTable] = useState<StudentExample[]>([])

  const value = useMemo(
    () => ({ activeStudent, setActiveStudent, studentExamplesTable, setStudentExamplesTable }),
    [activeStudent, studentExamplesTable],
  )

  return (
    <ActiveStudentContext.Provider value={value}>
      {children}
    </ActiveStudentContext.Provider>
  )
}

export default ActiveStudentContext
