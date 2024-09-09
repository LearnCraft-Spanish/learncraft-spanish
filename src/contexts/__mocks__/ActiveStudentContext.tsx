import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { samplePrograms, sampleStudent, sampleStudentFlashcardData } from '../../../tests/mockData'

import type { ActiveStudentContextProps } from '../ActiveStudentContext'

const ActiveStudentContext = createContext<ActiveStudentContextProps | undefined >(undefined)

interface ActiveStudentProviderProps {
  children: ReactNode
}

export function ActiveStudentProvider({ children }: ActiveStudentProviderProps) {
  // for tommorow, change these values from being defaulted in initial props to set here:
  /*
  activeStudent, activeLesson, activeProgram, studentFlashcardData, flashcardDataSynced, programsQuery, audioExamplesTable
  */

  const mockProgramsQuery = useQuery({ queryKey: ['mockPrograms'], queryFn: () => samplePrograms, staleTime: Infinity, gcTime: Infinity })

  const value = useMemo(
    () => ({
      activeStudent: sampleStudent,
      setActiveStudent: () => {},
      activeLesson: { current: samplePrograms[0].lessons[0] },
      activeProgram: { current: samplePrograms[0] },
      studentFlashcardData: sampleStudentFlashcardData,
      choosingStudent: false,
      chooseStudent: () => {},
      keepStudent: () => {},
      studentList: [],
      updateActiveStudent: () => {},
      flashcardDataSynced: true,
      setFlashcardDataSynced: () => {},
      syncFlashcards: () => {},
      programsQuery: mockProgramsQuery,
      audioExamplesTable: [],
    }),
    [mockProgramsQuery],
  )
  return (
    <ActiveStudentContext.Provider value={value}>
      {children}
    </ActiveStudentContext.Provider>
  )
}
