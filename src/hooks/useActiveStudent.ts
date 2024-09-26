import { useMemo } from 'react'
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

  const studentListQuery = useQuery({
    queryKey: ['studentList'],
    queryFn: getAllUsersFromBackend,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin, // Only fetch if the user is an admin
  })

  async function getActiveStudent(): Promise<UserData | null> {
    if (
      (!userDataQuery.data?.isAdmin || !queryClient.getQueryData(['activeStudentSelection']))
      && (userDataQuery.data?.role === 'student' || userDataQuery.data?.role === 'limited')
    ) {
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
    if (userDataQuery.data?.isAdmin && studentListQuery.data) {
      const student = studentListQuery.data.find(student => student.recordId === studentId) || null
      queryClient.setQueryData(['activeStudentSelection'], student)
      queryClient.invalidateQueries({ queryKey: ['activeStudent'] })
    }
  }

  // Lookup of the active student's default program and lesson when the program table is ready.
  const activeProgram = useMemo<Program | null>(() => {
    if (programTableQuery.data?.length && activeStudentQuery.data?.relatedProgram) {
      return programTableQuery.data.find(
        program => program.recordId === activeStudentQuery.data?.relatedProgram,
      ) || null
    }
    return null
  }, [programTableQuery.data, activeStudentQuery.data])

  const activeLesson = useMemo<Lesson | null>(() => {
    if (activeProgram && activeStudentQuery.data?.cohort) {
      const studentCohort = activeStudentQuery.data.cohort
      const getCohortLesson = (cohort: string) => {
        switch (cohort) {
          case 'A': return activeProgram?.cohortACurrentLesson
          case 'B': return activeProgram?.cohortBCurrentLesson
          case 'C': return activeProgram?.cohortCCurrentLesson
          case 'D': return activeProgram?.cohortDCurrentLesson
          case 'E': return activeProgram?.cohortECurrentLesson
          case 'F': return activeProgram?.cohortFCurrentLesson
          // case 'G': return activeProgram?.cohortGCurrentLesson
          // etc for futureproofing
        }
      }
      const cohortLesson = getCohortLesson(studentCohort)
      const maxLesson = cohortLesson || 999
      const lessonList: Lesson[] = []
      activeProgram.lessons?.forEach((lesson) => {
        const lessonArray = lesson.lesson.split(' ')
        const lessonString = lessonArray.slice(-1)[0]
        const lessonNumber = Number.parseInt(lessonString)
        if (lessonNumber <= maxLesson) {
          lessonList.push({ ...lesson })
        }
      })
      const lastKnownLesson: Lesson = lessonList.slice(-1)[0]
      if (lastKnownLesson) {
        return lastKnownLesson
      }
      return null
    }
    return null
  }, [activeProgram, activeStudentQuery.data])

  return {
    activeStudentQuery,
    activeProgram,
    activeLesson,
    studentListQuery,
    chooseStudent,
  }
}
