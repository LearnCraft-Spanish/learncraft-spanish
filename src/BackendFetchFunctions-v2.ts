const backendUrl = import.meta.env.VITE_BACKEND_URL

async function getFactory<T>(path: string, tokenPromise: Promise<string>): Promise<T> {
  const fetchUrl = `${backendUrl}${path}`
  const response = await fetch(fetchUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await tokenPromise}`,
    },
  })
    .then((res) => {
      if (res.ok) {
        return res.json().then((res) => {
          const data = res
          return data
        })
      }
    })
    .catch(e => console.error(e))
  return response
}

export async function getProgramsFromBackend(tokenPromise: Promise<string>) {
  return getFactory('public/programs', tokenPromise)
}

export async function getLessonsFromBackend(tokenPromise: Promise<string>) {
  return getFactory('public/lessons', tokenPromise)
}

export async function getFlashcardsFromBackend(tokenPromise: Promise<string>) {
  return getFactory('public/vocabulary', tokenPromise)
}

export async function getSpellingsFromBackend(tokenPromise: Promise<string>) {
  return getFactory('public/spellings', tokenPromise)
}

export async function getExamplesFromBackend(tokenPromise: Promise<string>) {
  return getFactory('public/examples', tokenPromise)
}

export async function getVerifiedExamplesFromBackend(tokenPromise: Promise<string>) {
  return getFactory('public/verified-examples', tokenPromise)
}

export async function getAudioExamplesFromBackend(tokenPromise: Promise<string>) {
  return getFactory('public/audio-examples', tokenPromise)
}

export async function getLcspQuizzesFromBackend(tokenPromise: Promise<string>) {
  return getFactory('public/quizzes', tokenPromise)
}

export async function getMyExamplesFromBackend(tokenPromise: Promise<string>) {
  return getFactory('my-examples', tokenPromise)
}

export async function getCoachList(tokenPromise: Promise<string>) {
  return getFactory('coaching/coaches', tokenPromise)
}

export async function getCourseList(tokenPromise: Promise<string>) {
  return getFactory('coaching/courses', tokenPromise)
}

export async function getLessonList(tokenPromise: Promise<string>) {
  return getFactory('coaching/lessons', tokenPromise)
}

export async function getActiveStudents(tokenPromise: Promise<string>) {
  return getFactory('coaching/active-students', tokenPromise)
}

export async function getActiveMemberships(tokenPromise: Promise<string>) {
  return getFactory('coaching/active-memberships', tokenPromise)
}

export async function getLastThreeWeeks(tokenPromise: Promise<string>) {
  return getFactory('coaching/last-three-weeks', tokenPromise)
}

export async function getQuizExamplesFromBackend(tokenPromise: Promise<string>, quizId: number) {
  const path = `public/quizExamples/${quizId}`
  return getFactory(path, tokenPromise)
}

// This is the same as BackendFetchFunctions v1, but typescript
export async function getActiveExamplesFromBackend(
  tokenPromise: Promise<string>,
  studentId: number,
  studentEmail: string,
) {
  const fetchUrl = `${backendUrl}${studentId}/examples`

  const tableFromBackend = await fetch(fetchUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${await tokenPromise}`, EmailAddress: studentEmail },
  })
    .then((res) => {
      if (res.ok) {
        return res.json().then((res) => {
          const data = res
          // console.log(data);
          return data
        })
      }
      else if (res.status === 403) {
        // console.log('unauthorized')
      }
    })
    .catch(e => console.error(e))

  return tableFromBackend
}

// extra params required:
/*
 getQuizExamplesFromBackend
 getActiveExamplesFromBackend
*/

// extra logic required:
/*
getAllUsersFromBackend
getUserDataFromBackend

*/
