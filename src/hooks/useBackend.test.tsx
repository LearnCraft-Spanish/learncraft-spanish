import React, { act } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, renderHook, waitFor } from '@testing-library/react'
import { Auth0Provider } from '@auth0/auth0-react'
import type { ReactNode } from 'react'
import { redirect } from 'react-router-dom'
import { get } from 'lodash'
import type { Lesson, Program } from '../interfaceDefinitions'
import { useBackend } from './useBackend'

interface contextProps {
  children: ReactNode
}

// Create a custom renderHook with context wrapper
function mockAuth0Provider({ children }: contextProps) {
  return (
    <Auth0Provider
      domain="test-domain"
      clientId="test-client-id"
      authorizationParams={
        {
          redirect_uri: 'http://localhost:3000',
          audience: 'test-audience',
          scope: 'test-scope',
        }
      }
    >
      {children}
    </Auth0Provider>
  )
}

describe('useBackend Hook', () => {
  // Rendering a component that uses the hook
  it('renders without crashing', async () => {
    const { result } = renderHook(() => useBackend(), { wrapper: mockAuth0Provider })
    expect(result).toBeDefined()
  })

  // Directly testing the hook itself
  it('has a programs fetch function', async () => {
    const { result } = renderHook(() => useBackend(), { wrapper: mockAuth0Provider })
    const { getProgramsFromBackend } = result.current
    expect(getProgramsFromBackend).toBeDefined()
    await act(async () => {
      describe('getProgramsFromBackend', async () => {
        const programs = await getProgramsFromBackend()
        it('returns something truthy', () => {
          expect(programs).toBeDefined()
        })
        it('returns an array of programs with recordIds', () => {
          expect(programs[0]?.recordId).toBeDefined()
        })
        it('returns an array with 4 elements', () => {
          expect(programs).toHaveLength(4) // Adjust this based on the mock data
        })
      })
    },
    )
  })

  it('gets the lessons table', async () => {
    const { result } = renderHook(() => useBackend(), { wrapper: mockAuth0Provider })
    const { getLessonsFromBackend } = result.current
    await act (async () => {
      const lessons = await getLessonsFromBackend()
      expect(lessons).toBeDefined()
    },
    )
  })
})
