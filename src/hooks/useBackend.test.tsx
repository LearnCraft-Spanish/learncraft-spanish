import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBackend } from './useBackend'

describe ('renders backend items', () => {
  it('renders backend items', () => {
    const hook = renderHook(useBackend)
    expect(hook).toBeInTheDocument()
  })
})
