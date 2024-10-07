import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import serverlikeData from '../../mocks/data/serverlike/serverlikeData'
import { useVocabulary } from './useVocabulary'

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

describe('useVocabulary', () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('runs without crashing', async () => {
    const { result } = renderHook(() => useVocabulary(), { wrapper })
    await waitFor(() => {
      expect(result.current.vocabularyQuery.isSuccess).toBe(true)
    })
    expect(result.current.vocabularyQuery.data).toBeDefined()
  })

  it('vocabularyQuery data has length', async () => {
    const { result } = renderHook(() => useVocabulary(), { wrapper })
    await waitFor(() => {
      expect(result.current.vocabularyQuery.isSuccess).toBe(true)
    })
    expect(result.current.vocabularyQuery.data?.length).toBeGreaterThan(0)
  })
})
