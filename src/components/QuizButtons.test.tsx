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

  it('renders correctly with an audio url', () => {
    render(<QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} togglePlaying={togglePlaying} currentAudioUrl="https://example.com/audio.mp3" />)
    expect(screen.getByText('Previous')).toBeTruthy()
    expect(screen.getByText('Next')).toBeTruthy()
    expect(screen.getByText('Play/Pause Audio')).toBeTruthy()
  })

  it('calls decrementExample when the Previous button is clicked', () => {
    render(<QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} togglePlaying={togglePlaying} currentAudioUrl="" />)
    screen.getByText('Previous').click()
    expect(decrementExample).toHaveBeenCalledOnce()
  })

  it('calls incrementExample when the Next button is clicked', () => {
    render(<QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} togglePlaying={togglePlaying} currentAudioUrl="" />)
    screen.getByText('Next').click()
    expect(incrementExample).toHaveBeenCalledOnce()
  })

  it('calls togglePlaying when the Play/Pause Audio button is clicked', () => {
    render(<QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} togglePlaying={togglePlaying} currentAudioUrl="https://example.com/audio.mp3" />)
    screen.getByText('Play/Pause Audio').click()
    expect(togglePlaying).toHaveBeenCalledOnce()
  })
})
