import { useCallback, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Lesson, Program, UserData } from '../interfaceDefinitions'
import { useBackend } from './useBackend'
import { useUserData } from './useUserData'
import { useProgramTable } from './useProgramTable'

export function useActiveStudent() {
  const { getAllUsersFromBackend } = useBackend()
  const { programTableQuery } = useProgramTable()
  const userDataQuery = useUserData()
  const queryClient = useQueryClient()

  // Lookup of the active student's default program and lesson when the program table is ready.
  const activeProgram = useRef<Program | null>(null)
  const activeLesson = useRef<Lesson | null>(null)

  const studentListQuery = useQuery({
    queryKey: ['studentList'],
    queryFn: getAllUsersFromBackend,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin, // Only fetch if the user is an admin
  })

  async function getActiveStudent(): Promise<UserData | null> {
    if (userDataQuery.data?.role === 'student' || userDataQuery.data?.role === 'limited') {
      return userDataQuery.data // Students are their own activeStudent
    }
    else if (userDataQuery.data?.isAdmin) {
      return queryClient.getQueryData(['activeStudentSelection']) || null// Admin-selected activeStudent
    }
    else {
      return null
    }
  }

  const activeStudentQuery = useQuery<UserData | null>({
    queryKey: ['activeStudent'],
    queryFn: getActiveStudent,
    staleTime: Infinity,
    enabled: !!userDataQuery.data, // Only run once userData is available
  })

  const chooseStudent = (studentId: number | null) => {
    if (userDataQuery.data?.isAdmin) {
      const student = studentListQuery.data?.find(student => student.recordId === studentId) || null
      queryClient.setQueryData(['activeStudentSelection'], student)
    }
  }

  const getStudentLevel = useCallback(() => {
    if (activeStudentQuery.data?.recordId && programTableQuery.data?.length) {
      let studentProgram = programTableQuery.data.find(
        program => program.recordId === activeStudentQuery.data?.relatedProgram,
      )
      if (studentProgram?.recordId) {
        const studentCohort = activeStudentQuery.data.cohort
        const getCohortLesson = (cohort: string) => {
          switch (cohort) {
            case 'A': return studentProgram?.cohortACurrentLesson
            case 'B': return studentProgram?.cohortBCurrentLesson
            case 'C': return studentProgram?.cohortCCurrentLesson
            case 'D': return studentProgram?.cohortDCurrentLesson
            case 'E': return studentProgram?.cohortECurrentLesson
            // case 'F': return studentProgram?.cohortFCurrentLesson
            // case 'G': return studentProgram?.cohortGCurrentLesson
            // etc for futureproofing
          }
        }
        const cohortLesson = getCohortLesson(studentCohort)
        const maxLesson = cohortLesson || 9999
        const lessonList: Lesson[] = []
        const programWithLessonList: Program = { ...studentProgram }
        programWithLessonList.lessons?.forEach((lesson) => {
          const lessonArray = lesson.lesson.split(' ')
          const lessonString = lessonArray.slice(-1)[0]
          const lessonNumber = Number.parseInt(lessonString)
          if (lessonNumber <= maxLesson) {
            lessonList.push({ ...lesson })
          }
        })
        programWithLessonList.lessons = lessonList
        studentProgram = programWithLessonList
        const lastKnownLesson: Lesson = programWithLessonList.lessons.slice(-1)[0] || {}
        activeProgram.current = studentProgram
        activeLesson.current = lastKnownLesson
      }
    }
    else {
      activeProgram.current = null
      activeLesson.current = null
    }
  }, [activeStudentQuery.data, programTableQuery.data])

  useEffect(() => {
    getStudentLevel()
  }, [getStudentLevel])

  return {
    activeStudent: activeStudentQuery.data,
    activeProgram: activeProgram.current,
    activeLesson: activeLesson.current,
    studentList: studentListQuery.data,
    chooseStudent,
    isLoading: activeStudentQuery.isLoading || studentListQuery.isLoading,
    isError: activeStudentQuery.isError || studentListQuery.isError,
  }
}
