import React from 'react'
import { describe, it } from 'vitest'
import { render } from '@testing-library/react'

import LoginButton from './LoginButton'

describe('login button', () => {
  it('renders without crashing', () => {
    render(<LoginButton />)
  })
})
