import React from 'react'
import { describe, it } from 'vitest'
import { render } from '@testing-library/react'

import LogoutButton from './LogoutButton'

describe('logout button', () => {
  it('renders without crashing', () => {
    render(<LogoutButton />)
  })
})
