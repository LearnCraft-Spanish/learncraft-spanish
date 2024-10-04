import { http, HttpResponse } from 'msw'
import data from '../data/serverlike/mockBackendData.json'
import flashcardData from '../data/serverlike/mockStudentFlashcardData.json'

const api = data.api
const studentFlashcardData = flashcardData.studentFlashcardData
const backendUrl = import.meta.env.VITE_BACKEND_URL

export const handlers = [

  http.get(`${backendUrl}public/programs`, () => {
    return HttpResponse.json(api.programsTable)
  }),

  http.get(`${backendUrl}public/lessons`, () => {
    return HttpResponse.json(api.lessonsTable)
  }),

  http.get(`${backendUrl}public/vocabulary`, () => {
    return HttpResponse.json(api.vocabularyTable)
  }),

  http.get(`${backendUrl}public/spellings`, () => {
    return HttpResponse.json(api.spellingsTable)
  }),

  http.get(`${backendUrl}public/verified-examples`, () => {
    return HttpResponse.json(api.verifiedExamplesTable)
  }),

  http.get(`${backendUrl}public/quizzes`, () => {
    return HttpResponse.json(api.quizzesTable)
  }),

  http.get(`${backendUrl}my-data`, () => {
    return HttpResponse.json(api.myData)
  }),

  http.get(`${backendUrl}all-students`, () => {
    return HttpResponse.json(api.allStudentsTable)
  }),

  http.get(`${backendUrl}my-examples`, () => {
    return HttpResponse.json(studentFlashcardData)
  }),

  // Post Requests
  http.post(`${backendUrl}create-my-student-example`, async ({ request }) => {
    const exampleId = request.headers.get('exampleid')
    if (exampleId === '-1') {
      return HttpResponse.json('0')
    }
    return HttpResponse.json('1')
  }),

  http.post(`${backendUrl}create-student-example`, async ({ request }) => {
    const exampleId = request.headers.get('exampleid')
    const studentId = request.headers.get('studentid')
    if (exampleId === '-1' || studentId === '-1') {
      return HttpResponse.json('0')
    }
    return HttpResponse.json('1')
  }),

  http.post(`${backendUrl}update-my-student-example`, async ({ request }) => {
    const updateId = request.headers.get('updateid')
    if (updateId === '-1') {
      return HttpResponse.json('0')
    }
    return HttpResponse.json(updateId)
  }),
  http.post(`${backendUrl}update-student-example`, async ({ request }) => {
    const updateId = request.headers.get('updateid')
    if (updateId === '-1') {
      return HttpResponse.json('0')
    }
    return HttpResponse.json(updateId)
  }),

  // Delete Requests
  http.delete(`${backendUrl}delete-my-student-example`, async ({ request }) => {
    const exampleId = request.headers.get('deleteid')
    if (exampleId === '-1') {
      return HttpResponse.json('0')
    }
    return HttpResponse.json('1')
  }),

  http.delete(`${backendUrl}delete-student-example`, async ({ request }) => {
    const exampleId = request.headers.get('deleteid')
    if (exampleId === '-1') {
      return HttpResponse.json('0')
    }
    return HttpResponse.json('1')
  }),
]
