import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '../src/mocks/api/server'
import '@testing-library/jest-dom'

beforeAll(() => server.listen())

afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => server.close())
