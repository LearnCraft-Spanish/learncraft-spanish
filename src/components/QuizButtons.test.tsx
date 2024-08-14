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
    expect(screen.queryByText('Play/Pause Audio')).toBeNull()
  })
})
