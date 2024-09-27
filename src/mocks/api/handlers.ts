import { HttpResponse, http } from 'msw'
import data from '../data/mockBackendData.json'

const api = data.api
const runningMode = import.meta.env.MODE
const backendUrl = import.meta.env.VITE_BACKEND_URL

console.log('mode:', runningMode)
console.log('backendUrl:', backendUrl)

export const handlers = [
  http.get(`${backendUrl}public/programs`, () => {
    console.log('hits the programs table!')
    return HttpResponse.json(api.programsTable)
  }),

  http.get(`${backendUrl}public/lessons`, () => {
    console.log('hits the lessons table!')
    return HttpResponse.json(api.lessonsTable)
  }),
]
