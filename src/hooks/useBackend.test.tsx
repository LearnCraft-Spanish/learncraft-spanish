import React, { act } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Auth0Provider } from '@auth0/auth0-react'
import type { ReactNode } from 'react'
import type { Program } from '../interfaceDefinitions'
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

// Directly testing the hook itself
describe('useBackend Hook', () => {
  it('renders without crashing', async () => {
    const { result } = renderHook(() => useBackend(), { wrapper: mockAuth0Provider })
    expect(result).toBeDefined()
  })

  describe('getProgramsFromBackend', () => {
    it('is defined', async () => {
      const { result } = renderHook(() => useBackend(), { wrapper: mockAuth0Provider })
      const { getProgramsFromBackend } = result.current
      expect(getProgramsFromBackend).toBeDefined()
    })

    describe('fetching programs', () => {
      let programs: Program[] | undefined

      beforeAll(async () => {
        const { result } = renderHook(() => useBackend(), { wrapper: mockAuth0Provider })
        const { getProgramsFromBackend } = result.current

        await act(async () => {
          programs = await getProgramsFromBackend()
        })
      })

      it('returns something truthy', () => {
        expect(programs).toBeDefined()
      })

      it('returns an array of programs with recordIds', () => {
        expect(programs?.[0]?.recordId).toBeDefined()
      })

      it('returns an array with 4 elements', () => {
        expect(programs).toHaveLength(4) // Adjust based on mock data
      })
    })
  })
})
