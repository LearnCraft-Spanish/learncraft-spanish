import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import QuizButtons from './QuizButtons'

const decrementExample = vi.fn()
const incrementExample = vi.fn()
const togglePlaying = vi.fn()

describe('component QuizButtons', () => {
  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })
  it('renders correctly with no audio url', () => {
    render(<QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} togglePlaying={togglePlaying} audioActive="" playing={false} />)
    expect(screen.getByText('Previous')).toBeTruthy()
    expect(screen.getByText('Next')).toBeTruthy()
    expect(screen.queryByText('Play/Pause Audio')).toBeNull()
  })

  it('renders correctly with an audio url and playing', () => {
    render(<QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} togglePlaying={togglePlaying} audioActive="https://example.com/audio.mp3" playing />)
    expect(screen.getByText('Previous')).toBeTruthy()
    expect(screen.getByText('Next')).toBeTruthy()
    expect(screen.getByText('Pause Audio')).toBeTruthy()
  })
  it('renders correctly with an audio url and not playing', () => {
    render(<QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} togglePlaying={togglePlaying} audioActive="https://example.com/audio.mp3" playing={false} />)
    expect(screen.getByText('Previous')).toBeTruthy()
    expect(screen.getByText('Next')).toBeTruthy()
    expect(screen.getByText('Play Audio')).toBeTruthy()
  })

  it('calls decrementExample when the Previous button is clicked', () => {
    render(<QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} togglePlaying={togglePlaying} audioActive="" playing />)
    screen.getByText('Previous').click()
    expect(decrementExample).toHaveBeenCalledOnce()
  })

  it('calls incrementExample when the Next button is clicked', () => {
    render(<QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} togglePlaying={togglePlaying} audioActive="" playing />)
    screen.getByText('Next').click()
    expect(incrementExample).toHaveBeenCalledOnce()
  })

  it('calls togglePlaying when the Pause Audio button is clicked', () => {
    render(<QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} togglePlaying={togglePlaying} audioActive="https://example.com/audio.mp3" playing />)
    screen.getByText('Pause Audio').click()
    expect(togglePlaying).toHaveBeenCalledOnce()
  })

  it('calls togglePlaying when the Play Audio button is clicked', () => {
    render(<QuizButtons decrementExample={decrementExample} incrementExample={incrementExample} togglePlaying={togglePlaying} audioActive="https://example.com/audio.mp3" playing={false} />)
    screen.getByText('Play Audio').click()
    expect(togglePlaying).toHaveBeenCalledOnce()
  })
})
