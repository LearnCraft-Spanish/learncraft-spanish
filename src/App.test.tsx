import React from 'react'
import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from './App'

describe('app', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App SentryRoutes />
      </MemoryRouter>,
    )
  })
})
