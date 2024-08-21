import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import * as auth0 from '@auth0/auth0-react'

import LogoutButton from './LogoutButton'

vi.mock('@auth0/auth0-react')

describe('logout button', () => {
  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })
  it('renders without crashing', () => {
    (auth0 as any).useAuth0 = vi.fn().mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
    })
    render(<LogoutButton />)
    expect(screen.getByText('Log Out')).toBeTruthy()
  })
  it('does not render when not authenticated', () => {
    (auth0 as any).useAuth0 = vi.fn().mockReturnValue({
      isAuthenticated: false,
    })
    render(<LogoutButton />)
    expect(screen.queryByText('Log Out')).toBeNull()
  })
})
