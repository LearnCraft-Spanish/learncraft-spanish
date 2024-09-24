import React from 'react'
import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import App from './App'

// Waiting for userData context to be finished
describe('app', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <App />
        </QueryClientProvider>
      </MemoryRouter>,
    )
  })
})
