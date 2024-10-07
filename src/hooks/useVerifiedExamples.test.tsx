import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import data from '../../mocks/data/serverlike/mockBackendData.json'
import { useVerifiedExamples } from './useVerifiedExamples'

interface WrapperProps {
  children: React.ReactNode
}

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
    await waitFor(() => expect(result.current.data?.length).toBeGreaterThan(0))
  })
})
