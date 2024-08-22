import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import debounce from 'lodash/debounce'
import type { Flashcard, Lesson, Program, StudentFlashcardData, UserData } from '../interfaceDefinitions' // Adjust the import based on your project structure
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
  setFlashcardDataSynced: (synced: boolean) => void
  syncFlashcards: () => void
  programTable: Program[]
  audioExamplesTable: Flashcard[]
}

const ActiveStudentContext = createContext<ActiveStudentContextProps | undefined>(undefined)

interface ActiveStudentProviderProps {
  children: ReactNode
}

export function ActiveStudentProvider({ children }: ActiveStudentProviderProps) {
  const { userData } = useUserData()
  const { getAllUsersFromBackend, getActiveExamplesFromBackend, getMyExamplesFromBackend, getProgramsFromBackend, getLessonsFromBackend, getAudioExamplesFromBackend } = useBackend()

  // UserData object of the active student
  const [activeStudent, setActiveStudent] = useState<UserData | null>(null)
  const activeProgram = useRef<Program>()
  const activeLesson = useRef<Lesson>()

  // If admin, can change the active student from list
  const [studentList, setStudentList] = useState<UserData[]>([])
  const [choosingStudent, setChoosingStudent] = useState(false)

  // States for initial data load independent of user access level
  const [programTable, setProgramTable] = useState<Program[]>([]) // Array of course objects. Each has a property of 'lessons': an array of lesson objects
  const [audioExamplesTable, setAudioExamplesTable] = useState<Flashcard[]>([]) // Array of all audio examples, used to determin whether audio quiz is available

  // Flashcard data, recently restructured as an object with two arrays as traits
  const [studentFlashcardData, setStudentFlashcardData] = useState<StudentFlashcardData | null>(null)

  // Whether the state is up to date with the actual database
  const [flashcardDataSynced, setFlashcardDataSynced] = useState(false)

  // Tracks syncs to prevent stale data
  const syncNumber = useRef(0)

  const setupStudentList = useCallback(async () => {
    getAllUsersFromBackend()
      .then((response) => {
        if (response)
          setStudentList(response)
      })
  }, [getAllUsersFromBackend])

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
    const newStudent = studentList.find(student => student.recordId === studentID)
    if (newStudent) {
      setActiveStudent(newStudent)
      setChoosingStudent(false)
    }
  }, [studentList, setActiveStudent])

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

  const parseCourseLessons = useCallback(async () => {
    const lessonTable = getLessonsFromBackend()
    const courses = getProgramsFromBackend()
    Promise.all([courses, lessonTable]).then((result) => {
      if (result[0] && result[1]) {
        const parsedLessons = parseLessonsByVocab(result[0], result[1])
        setProgramTable(parsedLessons)
      }
    })
  }, [getLessonsFromBackend, getProgramsFromBackend])

  const getStudentLevel = useCallback(() => {
    if (activeStudent?.recordId && programTable.length) {
      let studentProgram = programTable.find(
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
  }, [activeStudent, programTable])

  const matchAndTrimArrays = useCallback((flashcardData: StudentFlashcardData) => {
    const exampleArray = flashcardData.examples
    const studentExampleArray = flashcardData.studentExamples
    const filteredExamples = exampleArray.sort((a, b) => a.recordId - b.recordId)
    studentExampleArray.sort((a, b) => a.relatedExample - b.relatedExample)
    const filteredStudentExamples = studentExampleArray.filter((example) => {
      const match = studentExampleArray.find(studentExample => studentExample.relatedExample === example.recordId)
      return match
    })
    studentExampleArray.filter((studentExample) => {
      const match = exampleArray.find(example => example.recordId === studentExample.relatedExample)
      return match
    })
    if (filteredExamples.length === filteredStudentExamples.length) {
      return { examples: filteredExamples, studentExamples: filteredStudentExamples }
    }
    return null
  }, [])

  const syncFlashcards = useCallback(async () => {
    console.log('Syncing flashcards')
    syncNumber.current++
    const thisSyncNumber = syncNumber.current

    if (activeStudent?.recordId) {
      try {
        const dataPromise = userData?.isAdmin
          ? getActiveExamplesFromBackend(activeStudent?.recordId)
          : getMyExamplesFromBackend()

        const response = await dataPromise
        console.log(response)

        if (thisSyncNumber === syncNumber.current) {
          if (response?.examples && response?.studentExamples) {
            const newData = matchAndTrimArrays(response)
            console.log(newData)
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
  }, [activeStudent, getActiveExamplesFromBackend, getMyExamplesFromBackend, matchAndTrimArrays, userData?.isAdmin])

  const value = useMemo<ActiveStudentContextProps>(
    () => ({
      activeStudent,
      setActiveStudent,
      studentFlashcardData,
      choosingStudent,
      chooseStudent,
      keepStudent,
      studentList,
      updateActiveStudent,
      flashcardDataSynced,
      setFlashcardDataSynced,
      syncFlashcards,
      programTable,
      audioExamplesTable,
    }),
    [
      activeStudent,
      setActiveStudent,
      studentFlashcardData,
      choosingStudent,
      chooseStudent,
      keepStudent,
      studentList,
      updateActiveStudent,
      flashcardDataSynced,
      syncFlashcards,
      programTable,
      audioExamplesTable,
    ],
  )

  // If the user has a record in QB, set as Active Student
  useEffect(() => {
    if (userData?.recordId) {
      setActiveStudent(userData)
    }
  }, [userData, setActiveStudent])

  // If the user is admin, create list of students
  useEffect(() => {
    if (userData?.isAdmin) {
      setupStudentList()
    }
  }, [userData?.isAdmin, setupStudentList])

  // Parse the courses and lessons on load
  useEffect(() => {
    if (!programTable.length) {
      parseCourseLessons()
    }
  }, [programTable.length, parseCourseLessons])

  // Get the audio examples on load
  useEffect(() => {
    if (!audioExamplesTable.length) {
      setupAudioExamplesTable()
    }
  }, [audioExamplesTable.length, setupAudioExamplesTable])

  // If the active student changes, get their level
  useEffect(() => {
    getStudentLevel()
  }, [activeStudent, programTable, getStudentLevel])

  // If the state of the flashcard data changes between updates, sync it with the database
  useEffect(() => {
    console.log('activeStudent changed')
    if (activeStudent?.recordId) {
      console.log('activeStudent has recordId. Syncing flashcards')
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
