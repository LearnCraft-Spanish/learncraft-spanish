import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useProgramTable } from './useProgramTable'

interface WrapperProps {
  children: React.ReactNode
}

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

    await waitFor(() => expect(result.current.programTableQuery.isSuccess).toBe(true))
    expect(result.current.programTableQuery.data?.[0].lessons.length).toBeGreaterThan(0)
  })
})
