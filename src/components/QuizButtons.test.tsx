import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import QuizButtons from './QuizButtons'

const decrementExample = vi.fn()
const incrementExample = vi.fn()
const togglePlaying = vi.fn()

describe('component QuizButtons', () => {
  it('renders correctly with no audio url', () => {
    render(<QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} togglePlaying={togglePlaying} currentAudioUrl="" />)
    expect(screen.getByText('Previous')).toBeTruthy()
    expect(screen.getByText('Next')).toBeTruthy()
    // epect this component to have this, but have its display set to none

    expect(screen.queryByText('Play/Pause Audio')).toHaveProperty('style', 'display: none;')
  })
})
