import React from 'react'
import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from './App'
import Providers from './Providers'

// Waiting for userData context to be finished
describe('app', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Providers>
          <App />
        </Providers>
      </MemoryRouter>,
    )
  })
})
