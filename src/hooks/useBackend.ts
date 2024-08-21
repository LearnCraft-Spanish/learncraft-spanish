import { useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import type * as types from '../interfaceDefinitions'

export function useBackend() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const audience = import.meta.env.VITE_API_AUDIENCE
  const { getAccessTokenSilently } = useAuth0()

  const getAccessToken = useCallback(async () => {
    const accessToken = await getAccessTokenSilently({
      authorizationParams: {
        audience,
        scope:
          'openid profile email read:current-student update:current-student read:all-students update:all-students',
      },
      cacheMode: 'off',
    })
    return accessToken
  }, [getAccessTokenSilently, audience])

  const getFactory = useCallback(
    async <T>(path: string, headers?: any): Promise<T | undefined> => {
      try {
        const fetchUrl = `${backendUrl}${path}`
        const response = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
            ...headers,
          },
        })

        if (response.ok) {
          return await response.json()
        }
        else {
          console.error(`Failed to fetch ${path}: ${response.statusText}`)
        }
      }
      catch (error) {
        console.error(`Error fetching ${path}:`, error)
      }
      return undefined // Explicitly return undefined on failure
    },
    [getAccessToken, backendUrl],
  )

  /*      GET Requests      */

  const getProgramsFromBackend = useCallback((): Promise<types.Program[] | undefined> => {
    return getFactory<types.Program[]>('public/programs')
  }, [getFactory])

  const getLessonsFromBackend = useCallback((): Promise<types.Lesson[] | undefined> => {
    return getFactory<types.Lesson[]>('public/lessons')
  }, [getFactory])

  const getVocabFromBackend = useCallback((): Promise<types.Flashcard[] | undefined> => {
    return getFactory<types.Flashcard[]>('public/vocabulary')
  }, [getFactory])

  const getSpellingsFromBackend = useCallback((): Promise<types.Spelling[] | undefined> => {
    return getFactory<types.Spelling[]>('public/spellings')
  }, [getFactory])

  const getExamplesFromBackend = useCallback((): Promise<types.Flashcard[] | undefined> => {
    return getFactory<types.Flashcard[]>('public/examples')
  }, [getFactory])

  const getVerifiedExamplesFromBackend = useCallback((): Promise<types.Flashcard[] | undefined> => {
    return getFactory<types.Flashcard[]>('public/verified-examples')
  }, [getFactory])

  const getAudioExamplesFromBackend = useCallback((): Promise<types.Flashcard[] | undefined> => {
    return getFactory<types.Flashcard[]>('public/audio-examples')
  }, [getFactory])

  const getLcspQuizzesFromBackend = useCallback((): Promise<types.Quiz[] | undefined> => {
    return getFactory<types.Quiz[]>('public/quizzes')
  }, [getFactory])

  const getMyExamplesFromBackend = useCallback((): Promise<types.StudentFlashcardData | undefined> => {
    return getFactory<types.StudentFlashcardData>('my-examples')
  }, [getFactory])

  const getQuizExamplesFromBackend = useCallback((quizId: number): Promise<types.Flashcard[] | undefined> => {
    return getFactory<types.Flashcard[]>(`public/quizExamples/${quizId}`)
  }, [getFactory])

  const getAllUsersFromBackend = useCallback((): Promise<types.UserData[] | undefined> => {
    return getFactory<types.UserData[]>('all-students')
  }, [getFactory])

  const getUserDataFromBackend = useCallback((): Promise<types.UserData | undefined> => {
    return getFactory<types.UserData>('my-data')
  }, [getFactory])

  const getActiveExamplesFromBackend = useCallback(
    (studentId: number): Promise<types.StudentFlashcardData | undefined> => {
      return getFactory<types.StudentFlashcardData>(`${studentId}/examples`)
    },
    [getFactory],
  )

  /*      Coaching API      */

  const getCoachList = useCallback((): Promise<types.Coach[] | undefined> => {
    return getFactory<types.Coach[]>('coaching/coaches')
  }, [getFactory])

  const getCourseList = useCallback((): Promise<string[] | undefined> => {
    return getFactory<string[]>('coaching/courses')
  }, [getFactory])

  const getLessonList = useCallback((): Promise<string[] | undefined> => {
    return getFactory<string[]>('coaching/lessons')
  }, [getFactory])

  const getActiveStudents = useCallback((): Promise<string[] | undefined> => {
    return getFactory<string[]>('coaching/active-students')
  }, [getFactory])

  const getActiveMemberships = useCallback((): Promise<string[] | undefined> => {
    return getFactory<string[]>('coaching/active-memberships')
  }, [getFactory])

  const getLastThreeWeeks = useCallback((): Promise<string[] | undefined> => {
    return getFactory<string[]>('coaching/last-three-weeks')
  }, [getFactory])

  /*      POST Requests      */

  const postFactory = useCallback(
    async <T>(path: string, body: any, headers?: any): Promise<T | undefined> => {
      try {
        const fetchUrl = `${backendUrl}${path}`
        const response = await fetch(fetchUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await getAccessToken()}`,
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(body),
        })

        if (response.ok) {
          return await response.json()
        }
        else {
          console.error(`Failed to post to ${path}: ${response.statusText}`)
        }
      }
      catch (error) {
        console.error(`Error posting to ${path}:`, error)
      }
      return undefined // Explicitly return undefined on failure
    },
    [getAccessToken, backendUrl],
  )

  const createMyStudentExample = useCallback(
    (exampleId: number): Promise<number | undefined> => {
      return postFactory<number>('create-my-student-example', { exampleid: exampleId })
    },
    [postFactory],
  )

  const createStudentExample = useCallback(
    (studentId: number, exampleId: number): Promise<number | undefined> => {
      return postFactory<number>('create-student-example', { studentid: studentId, exampleid: exampleId })
    },
    [postFactory],
  )

  const updateMyStudentExample = useCallback(
    (updateId: number, newInterval: number): Promise<number | undefined> => {
      return postFactory<number>('update-my-student-example', { updateid: updateId, newinterval: newInterval })
    },
    [postFactory],
  )

  const updateStudentExample = useCallback(
    (updateId: number, newInterval: number): Promise<number | undefined> => {
      return postFactory<number>('update-student-example', { updateid: updateId, newinterval: newInterval })
    },
    [postFactory],
  )

  /*      DELETE Requests      */

  const deleteFactory = useCallback(
    async (path: string, headers?: any): Promise<number | undefined> => {
      try {
        const fetchUrl = `${backendUrl}${path}`
        const response = await fetch(fetchUrl, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
            ...headers,
          },
        })

        if (response.ok) {
          return await response.json()
        }
        else {
          console.error(`Failed to delete ${path}: ${response.statusText}`)
        }
      }
      catch (error) {
        console.error(`Error deleting ${path}:`, error)
      }
      return undefined // Explicitly return undefined on failure
    },
    [getAccessToken, backendUrl],
  )

  const deleteMyStudentExample = useCallback(
    (recordId: number): Promise<number | undefined> => {
      return deleteFactory('delete-my-student-example', { deleteid: recordId })
    },
    [deleteFactory],
  )

  const deleteStudentExample = useCallback(
    (recordId: number): Promise<number | undefined> => {
      return deleteFactory('delete-student-example', { deleteid: recordId })
    },
    [deleteFactory],
  )

  return {
    getAccessToken,
    getProgramsFromBackend,
    getLessonsFromBackend,
    getVocabFromBackend,
    getSpellingsFromBackend,
    getExamplesFromBackend,
    getVerifiedExamplesFromBackend,
    getAudioExamplesFromBackend,
    getLcspQuizzesFromBackend,
    getMyExamplesFromBackend,
    getQuizExamplesFromBackend,
    getAllUsersFromBackend,
    getUserDataFromBackend,
    getActiveExamplesFromBackend,
    getCoachList,
    getCourseList,
    getLessonList,
    getActiveStudents,
    getActiveMemberships,
    getLastThreeWeeks,
    createMyStudentExample,
    createStudentExample,
    updateMyStudentExample,
    updateStudentExample,
    deleteMyStudentExample,
    deleteStudentExample,
  }
}
