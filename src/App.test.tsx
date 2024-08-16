import React from 'react'
import { describe, it } from 'vitest'
import { render } from '@testing-library/react'

import App from './App'

describe('app', () => {
  it('renders without crashing', () => {
    render(<App SentryRoutes />)
  })
})
