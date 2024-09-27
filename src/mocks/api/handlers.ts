import { HttpResponse, http } from 'msw'
import data from '../data/mockBackendData.json'
import flashcardData from '../data/mockStudentFlashcardData.json'

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
]
