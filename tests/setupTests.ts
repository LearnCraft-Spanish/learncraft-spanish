import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import '@testing-library/jest-dom'

import { server } from '../src/mocks/api/server'

// Mock useAuth0 for getAccessTokenSilently
vi.mock('@auth0/auth0-react', async () => {
  const actualAuth0 = await vi.importActual<typeof import('@auth0/auth0-react')>('@auth0/auth0-react')

  return {
    ...actualAuth0, // Use the actual Auth0Provider
    useAuth0: () => ({
      getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
      isAuthenticated: true,
      user: { name: 'Test User' },
    }),
  }
})

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => server.close())
