import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import QuizProgress from './QuizProgress'

describe('component QuizProgress', () => {
  it('should render correctly', () => {
    render(<QuizProgress currentExampleNumber={1} totalExamplesNumber={5} />)
    expect(screen.getByText('Flashcard 1 of 5')).toBeTruthy()
  })
})
