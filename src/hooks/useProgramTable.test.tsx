import { renderHook, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import data from '../mocks/data/serverlike/mockBackendData.json'

import { useProgramTable } from './useProgramTable'

// Override the default project-wide mock

const api = data.api

interface WrapperProps {
  children: React.ReactNode
}

describe('useProgramTable', () => {
  beforeAll(() => {
    vi.unmock('@auth0/auth0-react')
    vi.mock('@auth0/auth0-react', () => ({
      useAuth0: vi.fn(() => ({
        isAuthenticated: true,
      })),
    }))
    vi.mock('../hooks/useBackend', () => ({
      useBackend: vi.fn(() => ({
        getLessonsFromBackend: vi.fn(() => api.programsTable),
        getProgramsFromBackend: vi.fn(() => api.lessonsTable),
      })),
    }))
  })
  it('runs without crashing', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: WrapperProps) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useProgramTable(), { wrapper })

    await waitFor(() => expect(result.current.programTableQuery.isSuccess).toBe(true))
    // expect(result.current.programTableQuery.data).toBeDefined()
  })
})
