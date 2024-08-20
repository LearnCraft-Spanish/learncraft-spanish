import React from 'react'
import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import MenuButton from './MenuButton'

describe('menu button', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <MenuButton />
      </MemoryRouter>,
    )
  })
})
