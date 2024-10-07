import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import serverlikeData from '../../mocks/data/serverlike/serverlikeData'
import { useActiveStudent } from './useActiveStudent'

const api = serverlikeData().api

const studentData = api.allStudentsTable.find(student => student.role === 'student')

interface WrapperProps {
  children: React.ReactNode
}

vi.unmock('./useUserData')
vi.mock('./useUserData', () => ({
  useUserData: vi.fn(() => ({
    isSuccess: true,
    data: studentData,
  })),
}))

describe('useActiveStudent', () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('runs without crashing', async () => {
    const { result } = renderHook(() => useActiveStudent(), { wrapper })
    await waitFor(() => expect(result.current.activeStudentQuery.isSuccess).toBe(true))
    expect(result.current.activeStudentQuery.data).toBeDefined()
  })
})
