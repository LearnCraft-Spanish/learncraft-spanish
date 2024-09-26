import * as auth0 from '@auth0/auth0-react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import type { Program } from '../interfaceDefinitions'
import data from '../mocks/data/mockBackendData.json'

import { useProgramTable } from './useProgramTable'

// Override the default project-wide mock

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
        getLessonsFromBackend: vi.fn(() => data.mockBackendData.getProgramsFromBackend),
        getProgramsFromBackend: vi.fn(() => data.mockBackendData.getLessonsFromBackend),
      })),
    }))
  })
  it('runs without crashing', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useProgramTable(), { wrapper })

    await waitFor(() => expect(result.current.programTableQuery.isSuccess).toBe(true))
    // expect(result.current.programTableQuery.data).toBeDefined()
  })
})
