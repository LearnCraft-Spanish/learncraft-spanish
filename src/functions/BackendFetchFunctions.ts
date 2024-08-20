import type * as types from '../interfaceDefinitions'

const backendUrl = import.meta.env.VITE_BACKEND_URL

async function getFactory<T>(path: string, tokenPromise: Promise<string>, headers?: any): Promise<T> {
  const fetchUrl = `${backendUrl}${path}`
  const response = await fetch(fetchUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await tokenPromise}`,
      ...headers,
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

export async function getProgramsFromBackend(tokenPromise: Promise<string>): Promise<types.Program[]> {
  return getFactory('public/programs', tokenPromise)
}

export async function getLessonsFromBackend(tokenPromise: Promise<string>): Promise<types.Lesson[]> {
  return getFactory('public/lessons', tokenPromise)
}

export async function getVocabFromBackend(tokenPromise: Promise<string>): Promise<types.Flashcard[]> {
  return getFactory('public/vocabulary', tokenPromise)
}

export async function getSpellingsFromBackend(tokenPromise: Promise<string>): Promise<types.Spelling[]> {
  return getFactory('public/spellings', tokenPromise)
}

export async function getExamplesFromBackend(tokenPromise: Promise<string>): Promise<types.Flashcard[]> {
  return getFactory('public/examples', tokenPromise)
}

export async function getVerifiedExamplesFromBackend(tokenPromise: Promise<string>): Promise<types.Flashcard[]> {
  return getFactory('public/verified-examples', tokenPromise)
}

export async function getAudioExamplesFromBackend(tokenPromise: Promise<string>): Promise<types.Flashcard[]> {
  return getFactory('public/audio-examples', tokenPromise)
}

export async function getLcspQuizzesFromBackend(tokenPromise: Promise<string>): Promise<types.Quiz[]> {
  return getFactory('public/quizzes', tokenPromise)
}

export async function getMyExamplesFromBackend(tokenPromise: Promise<string>): Promise<types.Flashcard[]> {
  return getFactory('my-examples', tokenPromise)
}
export async function getQuizExamplesFromBackend(tokenPromise: Promise<string>, quizId: number) {
  const path = `public/quizExamples/${quizId}`
  return getFactory(path, tokenPromise)
}
export async function getAllUsersFromBackend(tokenPromise: Promise<string>): Promise<types.UserData[]> {
  return getFactory('all-students', tokenPromise)
}
// export async function getAllUsersFromBackend(tokenPromise: Promise<string>) {
//   const fetchUrl = `${backendUrl}all-students`
//   // console.log(`Fetching ${fetchUrl}`)
//   const tableFromBackend = await fetch(fetchUrl, {
//     method: 'GET',
//     headers: { Authorization: `Bearer ${await tokenPromise}` },
//   })
//     .then((res) => {
//       if (res.ok) {
//         return res.json().then((res) => {
//           function sortFunction(a: any, b: any) {
//             if (a.sortReference > b.sortReference) {
//               return 1
//             }
//             if (a.sortReference < b.sortReference) {
//               return -1
//             }
//             return 0
//           }
//           const data = [res]
//           data.sort(sortFunction)
//           // console.log(data);
//           return data
//         })
//       }
//       else if (res.status === 403) {
//         // console.log('unauthorized')
//       }
//     })
//     .catch(e => console.error(e))

//   return tableFromBackend
// }

export async function getUserDataFromBackend(tokenPromise: Promise<string>): Promise<types.UserData> {
  return getFactory('my-data', tokenPromise)
}

// I dont think sort function is needed
// export async function getUserDataFromBackend(tokenPromise: Promise<string>) {
//   const fetchUrl = `${backendUrl}my-data`
//   // console.log(`Fetching ${fetchUrl}`)

//   const tableFromBackend = await fetch(fetchUrl, {
//     method: 'GET',
//     headers: { Authorization: `Bearer ${await tokenPromise}` },
//   })
//     .then((res) => {
//       if (res.ok) {
//         return res.json().then((res) => {
//           function sortFunction(a: any, b: any) {
//             if (a.sortReference > b.sortReference) {
//               return 1
//             }
//             if (a.sortReference < b.sortReference) {
//               return -1
//             }
//             return 0
//           }
//           const data = [res]
//           data.sort(sortFunction)
//           // console.log(data);
//           return data
//         })
//       }
//       else if (res.status === 403) {
//         // console.log('unauthorized')
//       }
//     })
//     .catch(e => console.error(e))

//   return tableFromBackend
// }

// This can be cleaned up, i dont think studentEmail is needed
export async function getActiveExamplesFromBackend(
  tokenPromise: Promise<string>,
  studentId: number,
): Promise<types.StudentExample[]> {
  const fetchUrl = `${backendUrl}${studentId}/examples`
  //  return getFactory(`${studentId}/examples`, tokenPromise, { EmailAddress: studentEmail })

  const tableFromBackend = await fetch(fetchUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${await tokenPromise}` },
  })
    .then((res) => {
      if (res.ok) {
        return res.json().then((res) => {
          const data = res
          return data
        })
      }
      else if (res.status === 403) {
        console.error('unauthorized')
      }
    })
    .catch(e => console.error(e))

  return tableFromBackend
}

/*      Coaching API      */

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

/*      Post Requests      */

async function postFactory(path: string, tokenPromise: Promise<string>, headers?: any) {
  const fetchUrl = `${backendUrl}${path}`
  const response = await fetch(fetchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await tokenPromise}`,
      ...headers,
    },
  })
    .then((res) => {
      if (res.ok) {
        return res.json()
      }
    })
    .catch(e => console.error(e))
  return response
}

export async function createMyStudentExample(tokenPromise: Promise<string>, exampleId: number): Promise<number> {
  return postFactory(`create-my-student-example`, tokenPromise, { exampleid: exampleId })
}

export async function createStudentExample(tokenPromise: Promise<string>, studentId: number, exampleId: number): Promise<number> {
  return postFactory(`create-student-example`, tokenPromise, { studentid: studentId, exampleid: exampleId })
}

export async function updateMyStudentExample(tokenPromise: Promise<string>, updateId: number, newInterval: number): Promise<number> {
  return postFactory(`update-my-student-example`, tokenPromise, { updateid: updateId, newinterval: newInterval })
}

export async function updateStudentExample(tokenPromise: Promise<string>, updateId: number, newInterval: number): Promise<number> {
  return postFactory(`update-student-example`, tokenPromise, { updateid: updateId, newinterval: newInterval })
}

/*     Delete Requests      */

async function deleteFactory(path: string, tokenPromise: Promise<string>, headers?: any) {
  const fetchUrl = `${backendUrl}${path}`
  const response = await fetch(fetchUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${await tokenPromise}`,
      ...headers,
    },
  })
    .then((res) => {
      if (res.ok) {
        return res.json()
      }
    })
    .catch(e => console.error(e))
  return response
}

export async function deleteMyStudentExample(tokenPromise: Promise<string>, recordId: number): Promise<number> {
  return deleteFactory(`delete-my-student-example`, tokenPromise, { deleteid: recordId })
}

export async function deleteStudentExample(tokenPromise: Promise<string>, recordId: number): Promise<number> {
  return deleteFactory(`delete-student-example`, tokenPromise, { deleteid: recordId })
}
