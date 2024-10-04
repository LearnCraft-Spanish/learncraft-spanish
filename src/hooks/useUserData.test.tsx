import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import data from '../mocks/data/serverlike/mockBackendData.json'
import { useUserData } from './useUserData'

interface WrapperProps {
  children: React.ReactNode
}

vi.unmock('@auth0/auth0-react')
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(() => ({
    isAuthenticated: true,
  })),
}))

vi.mock('./useBackend', () => ({
  useBackend: vi.fn(() => ({
    getUserDataFromBackend: vi.fn(() => data.api.myData),
  })),
}))

describe('useUserData', () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  it('runs without crashing', async () => {
    const { result } = renderHook(() => useUserData(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })

  it('data is mockData', async () => {
    const { result } = renderHook(() => useUserData(), { wrapper })
    await waitFor(() => expect(result.current.data).toEqual(data.api.myData))
  })
})
