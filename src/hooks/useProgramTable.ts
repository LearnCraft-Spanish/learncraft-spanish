import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Lesson, Program } from '../interfaceDefinitions' // Adjust the import based on your project structure
import { useBackend } from '../hooks/useBackend'
import { useUserData } from '../hooks/useUserData'

export function useProgramTable() {
  const userDataQuery = useUserData()
  const { getLessonsFromBackend, getProgramsFromBackend } = useBackend()

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

  const programTableQuery = useQuery({
    queryKey: ['programs'],
    queryFn: parseCourseLessons,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!userDataQuery.isSuccess,
  })

  return { programTableQuery }
}
