import { vi } from 'vitest'
import 'vitest/globals'
import { server } from './server'
import '@testing-library/jest-dom'

beforeAll(() => server.listen())

afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => server.close())
