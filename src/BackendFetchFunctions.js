const backendUrl = import.meta.env.VITE_BACKEND_URL
// console.log(backendUrl);

export async function getProgramsFromBackend(tokenPromise) {
  const fetchUrl = `${backendUrl}public/programs`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getLessonsFromBackend(tokenPromise) {
  const fetchUrl = `${backendUrl}public/lessons`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getVocabFromBackend(tokenPromise) {
  const fetchUrl = `${backendUrl}public/vocabulary`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getSpellingsFromBackend(tokenPromise) {
  const fetchUrl = `${backendUrl}public/spellings`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getExamplesFromBackend(tokenPromise) {
  const fetchUrl = `${backendUrl}public/examples`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getVerifiedExamplesFromBackend(tokenPromise) {
  const fetchUrl = `${backendUrl}public/verified-examples`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getAudioExamplesFromBackend(tokenPromise) {
  const fetchUrl = `${backendUrl}public/audio-examples`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getLcspQuizzesFromBackend(tokenPromise) {
  const fetchUrl = `${backendUrl}public/quizzes`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getQuizExamplesFromBackend(tokenPromise, quizId) {
  const fetchUrl = `${backendUrl}public/quizExamples/${quizId}`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getAllUsersFromBackend(tokenPromise) {
  const fetchUrl = `${backendUrl}all-students`
  // console.log(`Fetching ${fetchUrl}`)
  const tableFromBackend = await fetch(fetchUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${await tokenPromise}` },
  })
    .then((res) => {
      if (res.ok) {
        return res.json().then((res) => {
          function sortFunction(a, b) {
            if (a.sortReference > b.sortReference) {
              return 1
            }
            if (a.sortReference < b.sortReference) {
              return -1
            }
            return 0
          }
          const data = [res]
          data.sort(sortFunction)
          // console.log(data);
          return data
        })
      }
      else if (res.status === '403') {
        // console.log('unauthorized')
      }
    })
    .catch(e => console.error(e))

  return tableFromBackend
}

export async function getActiveExamplesFromBackend(
  tokenPromise,
  studentId,
  studentEmail,
) {
  const fetchUrl = `${backendUrl}${studentId}/examples`
  // console.log(`Fetching ${fetchUrl}`)

  const tableFromBackend = await fetch(fetchUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${await tokenPromise}`, EmailAddress: studentEmail },
  })
    .then((res) => {
      if (res.ok) {
        return res.json().then((res) => {
          const data = [res]
          // console.log(data);
          return data
        })
      }
      else if (res.status === '403') {
        // console.log('unauthorized')
      }
    })
    .catch(e => console.error(e))

  return tableFromBackend[0]
}

export async function getUserDataFromBackend(tokenPromise) {
  const fetchUrl = `${backendUrl}my-data`
  // console.log(`Fetching ${fetchUrl}`)

  const tableFromBackend = await fetch(fetchUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${await tokenPromise}` },
  })
    .then((res) => {
      if (res.ok) {
        return res.json().then((res) => {
          function sortFunction(a, b) {
            if (a.sortReference > b.sortReference) {
              return 1
            }
            if (a.sortReference < b.sortReference) {
              return -1
            }
            return 0
          }
          const data = [res]
          data.sort(sortFunction)
          // console.log(data);
          return data
        })
      }
      else if (res.status === '403') {
        // console.log('unauthorized')
      }
    })
    .catch(e => console.error(e))

  return tableFromBackend
}

export async function getMyExamplesFromBackend(tokenPromise) {
  const fetchUrl = `${backendUrl}my-examples`

  // console.log(`Fetching ${fetchUrl}`)

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
    })
    .catch(e => console.error(e))

  return tableFromBackend
}

export async function createMyStudentExample(tokenPromise, exampleId) {
  const headers = { Authorization: `Bearer ${await tokenPromise}`, exampleid: exampleId }
  // console.log(headers)
  const fetchUrl = `${backendUrl}create-my-student-example`
  // console.log(`Fetching ${fetchUrl}`)
  const messageFromBackend = await fetch(fetchUrl, {
    method: 'POST',
    headers,
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

  return messageFromBackend
}

export async function createStudentExample(tokenPromise, studentId, exampleId) {
  const headers = {
    Authorization: `Bearer ${await tokenPromise}`,
    studentid: studentId,
    exampleid: exampleId,
  }
  // console.log(headers)
  const fetchUrl = `${backendUrl}create-student-example`
  // console.log(`Fetching ${fetchUrl}`)
  const messageFromBackend = await fetch(fetchUrl, {
    method: 'POST',
    headers,
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

  return messageFromBackend
}

export async function updateMyStudentExample(tokenPromise, updateId, newInterval) {
  const headers = {
    Authorization: `Bearer ${await tokenPromise}`,
    updateId,
    newInterval,
  }
  const fetchUrl = `${backendUrl}update-my-student-example`
  const messageFromBackend = await fetch(fetchUrl, {
    method: 'POST',
    headers,
  })
    .then((res) => {
      console.log(res)
      if (res.ok) {
        return res.json()
      }
    })
    .catch(e => console.error(e))

  return messageFromBackend
}

export async function updateStudentExample(tokenPromise, updateId, newInterval) {
  const headers = {
    Authorization: `Bearer ${await tokenPromise}`,
    updateId,
    newInterval,
  }
  // console.log(headers)
  const fetchUrl = `${backendUrl}update-student-example`
  // console.log(`Fetching ${fetchUrl}`)
  const messageFromBackend = await fetch(fetchUrl, {
    method: 'POST',
    headers,
  })
    .then((res) => {
      console.log(res)
      if (res.ok) {
        return res.json()
      }
    })
    .catch(e => console.error(e))

  return messageFromBackend
}

export async function deleteMyStudentExample(tokenPromise, recordId) {
  const headers = { Authorization: `Bearer ${await tokenPromise}`, deleteid: recordId }
  // console.log(headers)
  const fetchUrl = `${backendUrl}delete-my-student-example`
  // console.log(`Fetching ${fetchUrl}`)
  const messageFromBackend = await fetch(fetchUrl, {
    method: 'DELETE',
    headers,
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

  return messageFromBackend
}

export async function deleteStudentExample(tokenPromise, recordId) {
  const headers = { Authorization: `Bearer ${await tokenPromise}`, deleteid: recordId }
  // console.log(headers)
  const fetchUrl = `${backendUrl}delete-student-example`
  // console.log(`Fetching ${fetchUrl}`)
  const messageFromBackend = await fetch(fetchUrl, {
    method: 'DELETE',
    headers,
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

  return messageFromBackend
}

export async function getCoachList(tokenPromise) {
  const fetchUrl = `${backendUrl}coaching/coaches`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getCourseList(tokenPromise) {
  const fetchUrl = `${backendUrl}coaching/courses`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getLessonList(tokenPromise) {
  const fetchUrl = `${backendUrl}coaching/lessons`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getActiveStudents(tokenPromise) {
  const fetchUrl = `${backendUrl}coaching/active-students`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getActiveMemberships(tokenPromise) {
  const fetchUrl = `${backendUrl}coaching/active-memberships`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}

export async function getLastThreeWeeks(tokenPromise) {
  const fetchUrl = `${backendUrl}coaching/last-three-weeks`
  // console.log(`Fetching ${fetchUrl}`)
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
    })
    .catch(e => console.error(e))
  return tableFromBackend
}
