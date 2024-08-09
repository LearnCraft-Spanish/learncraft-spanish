import { vi } from 'vitest'
import '@testing-library/jest-dom'

import {
  sampleActiveExamples,
  sampleAudioExamples,
  sampleLessons,
  sampleMyExamples,
  samplePrograms,
  sampleStudent,
  sampleUserList,
} from './mockData'

// Mock the API functions
vi.mock('../src/BackendFetchFunctions', () => ({
  getUserDataFromBackend: vi.fn().mockResolvedValue(sampleStudent),
  getLessonsFromBackend: vi.fn().mockResolvedValue(sampleLessons),
  getAudioExamplesFromBackend: vi.fn().mockResolvedValue(sampleAudioExamples),
  getActiveExamplesFromBackend: vi.fn().mockResolvedValue(sampleActiveExamples),
  createStudentExample: vi.fn().mockResolvedValue('1'),
  createMyStudentExample: vi.fn().mockResolvedValue('1'),
  deleteStudentExample: vi.fn().mockResolvedValue('1'),
  deleteMyStudentExample: vi.fn().mockResolvedValue('1'),
  getAllUsersFromBackend: vi.fn().mockResolvedValue(sampleUserList),
  getProgramsFromBackend: vi.fn().mockResolvedValue(samplePrograms),
  getMyExamplesFromBackend: vi.fn().mockResolvedValue(sampleMyExamples),
}))

// Mock Menu component
vi.mock('../src/Menu', () => ({
  __esModule: true,
  default: () => <div>Mocked Menu Component</div>,
}))

// Mock SimpleQuizApp component
vi.mock('../src/SimpleQuizApp', () => ({
  __esModule: true,
  default: () => <div>Mocked SimpleQuizApp Component</div>,
}))

// Mock AudioQuiz component
vi.mock('../src/AudioQuiz', () => ({
  __esModule: true,
  default: () => <div>Mocked AudioQuiz Component</div>,
}))

// Mock SentryRoutes if necessary
vi.mock('@sentry/react', () => ({
  SentryRoutes: ({ children }) => <div>{children}</div>,
}))

// Mock useLocation hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    }),
    useNavigate: () => vi.fn(),
    BrowserRouter: ({ children }) => <div>{children}</div>,
  }
})
