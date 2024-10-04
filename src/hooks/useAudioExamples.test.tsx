import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import data from '../../mocks/data/serverlike/mockBackendData.json'
import { useAudioExamples } from './useAudioExamples'

interface WrapperProps {
  children: React.ReactNode
}
vi.unmock('./useUserData')
vi.mock('./useUserData', () => ({
  useUserData: vi.fn(() => ({
    isSuccess: true,
  })),
}))

vi.mock('./useBackend', () => ({
  useBackend: vi.fn(() => ({
    getAudioExamplesFromBackend: vi.fn(() => data.api.audioExamplesTable),
  })),
}))

describe('useAudioExamples', () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  it('runs without crashing', async () => {
    const { result } = renderHook(() => useAudioExamples(), { wrapper })
    await waitFor(() => expect(result.current.audioExamplesQuery.isSuccess).toBe(true))
    expect(result.current.audioExamplesQuery.data).toBeDefined()
  })

  it('data length is mockDataLength', async () => {
    const { result } = renderHook(() => useAudioExamples(), { wrapper })
    await waitFor(() => expect(result.current.audioExamplesQuery.data?.length).toBe(data.api.audioExamplesTable.length))
  })
})
