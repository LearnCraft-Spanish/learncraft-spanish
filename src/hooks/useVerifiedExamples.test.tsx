import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import serverlikeData from '../../mocks/data/serverlike/serverlikeData'
import { useVerifiedExamples } from './useVerifiedExamples'

const api = serverlikeData().api
const studentAdmin = api.allStudentsTable.find(student => student.role === 'student' && student.isAdmin === true)
interface WrapperProps {
  children: React.ReactNode
}

vi.unmock('./useUserData')
vi.mock('./useUserData', () => ({
  useUserData: vi.fn(() => ({
    isSuccess: true,
    data: studentAdmin,
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

  it('data has length', async () => {
    const { result } = renderHook(() => useVerifiedExamples(), { wrapper })
    await waitFor(() => expect(result.current.data?.length).toBeGreaterThan(0))
  })
})
