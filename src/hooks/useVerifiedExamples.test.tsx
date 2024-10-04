import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import data from '../../mocks/data/serverlike/mockBackendData.json'
import { useVerifiedExamples } from './useVerifiedExamples'

interface WrapperProps {
  children: React.ReactNode
}
vi.unmock('./useVerifiedExamples')

vi.unmock('@auth0/auth0-react')
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(() => ({
    isAuthenticated: true,
  })),
}))

vi.mock('./useBackend', () => ({
  useBackend: vi.fn(() => ({
    getVerifiedExamplesFromBackend: vi.fn(() => data.api.verifiedExamplesTable),
  })),
}))

vi.unmock('./useUserData')
vi.mock('./useUserData', () => ({
  useUserData: vi.fn(() => ({
    isSuccess: true,
    data: data.api.myData,
  })),
}))

describe('useVerifiedExamples', () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('runs without crashing', async () => {
    const { result } = renderHook(() => useVerifiedExamples(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })

  it('data length is mockDataLength', async () => {
    const { result } = renderHook(() => useVerifiedExamples(), { wrapper })
    await waitFor(() => expect(result.current.data?.length).toBe(data.api.verifiedExamplesTable.length))
  })
})
