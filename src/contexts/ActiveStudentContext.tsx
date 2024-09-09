import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import type { Flashcard, Lesson, Program, StudentFlashcardData, UserData } from '../interfaceDefinitions' // Adjust the import based on your project structure
import { useBackend } from '../hooks/useBackend'
import { useUserData } from '../hooks/useUserData'

export interface ActiveStudentContextProps {
  activeStudent: UserData | null
  setActiveStudent: (student: UserData | null) => void
  activeLesson: React.MutableRefObject<Lesson | undefined>
  activeProgram: React.MutableRefObject<Program | undefined>
  studentFlashcardData: StudentFlashcardData | null
  choosingStudent: boolean
  chooseStudent: () => void
  keepStudent: () => void
  updateActiveStudent: (studentID: number) => void
  flashcardDataSynced: boolean
  setFlashcardDataSynced: (synced: boolean) => void
  syncFlashcards: () => void
  programsQuery: UseQueryResult <Program[] | undefined>
  studentListQuery: UseQueryResult <UserData[] | undefined>
  audioExamplesTable: Flashcard[]
}

const ActiveStudentContext = createContext<ActiveStudentContextProps | undefined>(undefined)

interface ActiveStudentProviderProps {
  children: ReactNode
}

export function ActiveStudentProvider({ children }: ActiveStudentProviderProps) {
  const userDataQuery = useUserData()
  const { getAllUsersFromBackend, getActiveExamplesFromBackend, getMyExamplesFromBackend, getProgramsFromBackend, getLessonsFromBackend, getAudioExamplesFromBackend } = useBackend()

  // UserData object of the active student
  const [activeStudent, setActiveStudent] = useState<UserData | null>(null)
  const activeProgram = useRef<Program>()
  const activeLesson = useRef<Lesson>()

  // If admin, can change the active student from list
  const [choosingStudent, setChoosingStudent] = useState(false)

  // States for initial data load independent of user access level
  const [audioExamplesTable, setAudioExamplesTable] = useState<Flashcard[]>([]) // Array of all audio examples, used to determine whether audio quiz is available

  // Flashcard data, recently restructured as an object with two arrays as traits
  const [studentFlashcardData, setStudentFlashcardData] = useState<StudentFlashcardData | null>(null)

  // Whether the state is up to date with the actual database
  const [flashcardDataSynced, setFlashcardDataSynced] = useState(false)

  // Tracks syncs to prevent stale data
  const syncNumber = useRef(0)

  const studentListQuery = useQuery({
    queryKey: ['students'],
    queryFn: getAllUsersFromBackend,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  })

  const setupAudioExamplesTable = useCallback(async () => {
    getAudioExamplesFromBackend()
      .then((response) => {
        if (response)
          setAudioExamplesTable(response)
      })
  }, [getAudioExamplesFromBackend])

  const chooseStudent = useCallback(() => {
    setChoosingStudent(true)
  }, [])

  const keepStudent = useCallback(() => {
    setChoosingStudent(false)
  }, [])

  const updateActiveStudent = useCallback((studentID: number) => {
    if (studentListQuery.isSuccess) {
      const newStudent = studentListQuery.data?.find(student => student.recordId === studentID)
      if (newStudent) {
        setActiveStudent(newStudent)
        setChoosingStudent(false)
      }
    }
  }, [studentListQuery.isSuccess, studentListQuery.data, setActiveStudent])

  function parseLessonsByVocab(courses: Program[], lessonTable: Lesson[]) {
    const newCourseArray: Program[] = [...courses]
    newCourseArray.forEach((course) => {
      const combinedVocabulary: string[] = []
      const lessonSortFunction = (a: Lesson, b: Lesson) => {
        function findNumber(stringLesson: string) {
          const lessonArray = stringLesson.split(' ')
          const lessonNumber = lessonArray.slice(-1)[0]
          const lessonNumberInt = Number.parseInt(lessonNumber)
          return lessonNumberInt
        }
        return findNumber(a.lesson) - findNumber(b.lesson)
      }
      const parsedLessonArray: Lesson[] = []
      lessonTable.forEach((lesson) => {
        if (lesson.relatedProgram === course.recordId) {
          parsedLessonArray.push({ ...lesson })
        }
      })
      parsedLessonArray.sort(lessonSortFunction)
      course.lessons = parsedLessonArray
      course.lessons.forEach((lesson) => {
        lesson.vocabIncluded.forEach((word) => {
          if (!combinedVocabulary.includes(word)) {
            combinedVocabulary.push(word)
          }
        })
        lesson.vocabKnown = [...combinedVocabulary]
      })
      return course
    })
    return newCourseArray
  }

  const parseCourseLessons = useCallback(async (): Promise<Program[]> => {
    try {
      const lessonTablePromise = getLessonsFromBackend()
      const coursesPromise = getProgramsFromBackend()

      // Using Promise.all to wait for both promises to resolve
      const [courses, lessonTable] = await Promise.all([coursesPromise, lessonTablePromise])

      if (courses && lessonTable) {
        // Parse lessons based on vocab and return result
        const parsedLessons: Program[] = parseLessonsByVocab(courses, lessonTable)
        return parsedLessons
      }
      else {
        throw new Error('Failed to get programs or lessons')
      }
    }
    catch (error) {
      console.error(error)
      throw error // Re-throw to propagate the error
    }
  }, [getLessonsFromBackend, getProgramsFromBackend])

  const programsQuery = useQuery({
    queryKey: ['programs'],
    queryFn: parseCourseLessons,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!userDataQuery.isSuccess,
  })

  const getStudentLevel = useCallback(() => {
    if (activeStudent?.recordId && programsQuery.data?.length) {
      let studentProgram = programsQuery.data.find(
        program => program.recordId === activeStudent.relatedProgram,
      )
      if (studentProgram?.recordId) {
        const studentCohort = activeStudent.cohort
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
  }, [activeStudent, programsQuery.data])

  const matchAndTrimArrays = useCallback((flashcardData: StudentFlashcardData) => {
    const exampleArray = flashcardData.examples
    const studentExampleArray = flashcardData.studentExamples
    const sortedExamples = exampleArray.sort((a, b) => a.recordId - b.recordId)
    const sortedStudentExamples = studentExampleArray.sort((a, b) => a.relatedExample - b.relatedExample)
    const filteredExamples = sortedExamples.filter((example) => {
      const match = studentExampleArray.find(studentExample => studentExample.relatedExample === example.recordId)
      return match
    })
    const filteredStudentExamples = sortedStudentExamples.filter((studentExample) => {
      const match = exampleArray.find(example => example.recordId === studentExample.relatedExample)
      return match
    })
    if (filteredExamples.length === filteredStudentExamples.length) {
      return { examples: filteredExamples, studentExamples: filteredStudentExamples }
    }
    return null
  }, [])

  const syncFlashcards = useCallback(async () => {
    syncNumber.current++
    const thisSyncNumber = syncNumber.current

    if (activeStudent?.recordId) {
      try {
        const dataPromise = userDataQuery.data?.isAdmin
          ? getActiveExamplesFromBackend(activeStudent?.recordId)
          : getMyExamplesFromBackend()

        const response = await dataPromise

        if (thisSyncNumber === syncNumber.current) {
          if (response?.examples && response?.studentExamples) {
            const newData = matchAndTrimArrays(response)
            setStudentFlashcardData(newData)
          }
          setFlashcardDataSynced(true)
          syncNumber.current = 0
        }
      }
      catch (error) {
        console.error(error)
      }
    }
    else {
      if (userDataQuery.data?.isAdmin) {
        setFlashcardDataSynced(true)
      }
    }
  }, [activeStudent, getActiveExamplesFromBackend, getMyExamplesFromBackend, matchAndTrimArrays, userDataQuery.data?.isAdmin])

  const value = useMemo<ActiveStudentContextProps>(
    () => ({
      activeStudent,
      activeLesson,
      activeProgram,
      setActiveStudent,
      studentFlashcardData,
      choosingStudent,
      chooseStudent,
      keepStudent,
      updateActiveStudent,
      flashcardDataSynced,
      setFlashcardDataSynced,
      syncFlashcards,
      programsQuery,
      studentListQuery,
      audioExamplesTable,
    }),
    [
      activeStudent,
      activeLesson,
      activeProgram,
      setActiveStudent,
      studentFlashcardData,
      choosingStudent,
      chooseStudent,
      keepStudent,
      updateActiveStudent,
      flashcardDataSynced,
      syncFlashcards,
      programsQuery,
      studentListQuery,
      audioExamplesTable,
    ],
  )

  // If the user has a record in QB, set as Active Student
  useEffect(() => {
    if (userDataQuery.data?.role === 'student' || userDataQuery.data?.role === 'limited') {
      setActiveStudent(userDataQuery.data)
    }
  }, [userDataQuery.data, setActiveStudent])

  // Parse the courses and lessons on load
  useEffect(() => {
    if (userDataQuery.isSuccess && !programsQuery.data?.length) {
      parseCourseLessons()
    }
  }, [userDataQuery.isSuccess, programsQuery.data?.length, parseCourseLessons])

  // Get the audio examples on load
  useEffect(() => {
    if (userDataQuery.isSuccess && !audioExamplesTable.length) {
      setupAudioExamplesTable()
    }
  }, [userDataQuery.isSuccess, audioExamplesTable.length, setupAudioExamplesTable])

  // If the active student changes, get their level
  useEffect(() => {
    getStudentLevel()
  }, [activeStudent, programsQuery.data, getStudentLevel])

  // If the state of the flashcard data changes between updates, sync it with the database
  useEffect(() => {
    if (activeStudent?.recordId) {
      syncFlashcards()
    }
    // Make sure we consider non-student users as well
  }, [activeStudent, syncFlashcards])

  return (
    <ActiveStudentContext.Provider value={value}>
      {children}
    </ActiveStudentContext.Provider>
  )
}

export default ActiveStudentContext
