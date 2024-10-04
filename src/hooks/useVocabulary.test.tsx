import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import data from '../../mocks/data/api/mockBackendData.json'
import { useVocabulary } from './useVocabulary'

interface WrapperProps {
  children: React.ReactNode
}

vi.unmock('./useBackend')
vi.mock('./useBackend', () => ({
  useBackend: vi.fn(() => ({
    getVocabFromBackend: vi.fn(() => data.api.vocabularyTable),
  })),
}))

vi.unmock('./useUserData')
vi.mock('./useUserData', () => ({
  useUserData: vi.fn(() => ({
    isSuccess: true,
    data: data.api.myData,
  })),
}))

describe('useVocabulary', () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('runs without crashing', async () => {
    const { result } = renderHook(() => useVocabulary(), { wrapper })
    await waitFor(() => expect(result.current.vocabularyQuery.isSuccess).toBe(true))
    expect(result.current.vocabularyQuery.data).toBeDefined()
  })

  it('data length is mockDataLength', async () => {
    const { result } = renderHook(() => useVocabulary(), { wrapper })
    await waitFor(() => expect(result.current.vocabularyQuery.data?.length).toBe(data.api.vocabularyTable.length))
  })
})
