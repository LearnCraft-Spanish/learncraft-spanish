import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import data from '../mocks/data/serverlike/mockBackendData.json'

import { useProgramTable } from './useProgramTable'

const api = data.api

interface WrapperProps {
  children: React.ReactNode
}

vi.unmock('@auth0/auth0-react')
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(() => ({
    isAuthenticated: true,
  })),
}))
vi.mock('../hooks/useBackend', () => ({
  useBackend: vi.fn(() => ({
    getLessonsFromBackend: vi.fn(() => api.lessonsTable),
    getProgramsFromBackend: vi.fn(() => api.programsTable),
  })),
}))

describe('useProgramTable', () => {
  it('renders with correct mocks', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: WrapperProps) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useProgramTable(), { wrapper })

    await waitFor(() => expect(result.current.programTableQuery.isSuccess).toBe(true))
    expect(result.current.programTableQuery.data).toBeDefined()
  })
  it('data has length', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: WrapperProps) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useProgramTable(), { wrapper })

    await waitFor(() => expect(result.current.programTableQuery.data?.length).toBeGreaterThan(0))
  })
  it('data has correct structure', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: WrapperProps) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useProgramTable(), { wrapper })

    await waitFor(() => {
      expect(result.current.programTableQuery.data).toEqual(api.programsTable)
    })
    expect(result.current.programTableQuery.data?.[0].lessons.length).toBeGreaterThan(0)
  })
})
