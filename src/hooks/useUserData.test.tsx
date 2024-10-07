import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

// import serverL from '../../mocks/data/serverlike/mockBackendData.json'
import serverLikeData from '../../mocks/data/serverlike/serverlikeData'
import { useUserData } from './useUserData'

const api = serverLikeData().api

interface WrapperProps {
  children: React.ReactNode
}

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
    await waitFor(() => expect(result.current.data).toEqual(api.allStudentsTable[0]))
  })
})
