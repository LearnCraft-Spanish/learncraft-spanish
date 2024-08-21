import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import MenuButton from './MenuButton'

describe('menu button', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <MenuButton />
      </MemoryRouter>,
    )
    expect(screen.getByText('Back to Menu')).toBeTruthy()
  })
})
