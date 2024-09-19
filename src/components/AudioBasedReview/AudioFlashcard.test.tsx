import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import AudioFlashcardComponent from './AudioFlashcard'

const incrementCurrentStep = vi.fn(() => {})
const pausePlayback = vi.fn(() => {})
const resumePlayback = vi.fn(() => {})

function AudioFlashcardAutoplayOn() {
  return (
    <AudioFlashcardComponent
      currentExampleText="currentExampleText"
      incrementCurrentStep={incrementCurrentStep}
      autoplay
      progressStatus={0.5}
      pausePlayback={pausePlayback}
      resumePlayback={resumePlayback}
      isPlaying
    />
  )
}
function AudioFlashcardAutoplayOff() {
  return (
    <AudioFlashcardComponent
      currentExampleText="currentExampleText"
      incrementCurrentStep={incrementCurrentStep}
      autoplay={false}
      progressStatus={0.5}
      pausePlayback={pausePlayback}
      resumePlayback={resumePlayback}
      isPlaying
    />
  )
}

function AudioFlashcardPlaying() {
  return (
    <AudioFlashcardComponent
      currentExampleText="currentExampleText"
      incrementCurrentStep={incrementCurrentStep}
      autoplay
      progressStatus={0.5}
      pausePlayback={pausePlayback}
      resumePlayback={resumePlayback}
      isPlaying
    />
  )
}
function AudioFlashcardPaused() {
  return (
    <AudioFlashcardComponent
      currentExampleText="currentExampleText"
      incrementCurrentStep={incrementCurrentStep}
      autoplay
      progressStatus={0.5}
      pausePlayback={pausePlayback}
      resumePlayback={resumePlayback}
      isPlaying={false}
    />
  )
}

describe('component AudioFlashcard', () => {
  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })
  it('should render the component', () => {
    render(<AudioFlashcardAutoplayOn />)
    expect(screen.getByText('currentExampleText')).toBeTruthy()
  })

  describe('autoplay is off', () => {
    it('on click, calls incrementCurrentStep', () => {
      render(<AudioFlashcardAutoplayOff />)
      screen.getByText('currentExampleText').click()
      expect(incrementCurrentStep).toHaveBeenCalledOnce()
    })
  })

  describe('autoplay is on', () => {
    it('on click does NOT call incrementCurrentStep', () => {
      render(<AudioFlashcardAutoplayOn />)
      screen.getByText('currentExampleText').click()
      expect(incrementCurrentStep).not.toHaveBeenCalled()
    })

    describe('toggling Play/Pause', () => {
      it('renders correctly', () => {
        render(<AudioFlashcardAutoplayOn />)
        expect(screen.getAllByLabelText('Play/Pause')).toBeTruthy()
      })
      it('isPlaying is true: on click, calls pausePlayback', () => {
        render(<AudioFlashcardPlaying />)
        screen.getAllByLabelText('Play/Pause')[0].click()
        expect(pausePlayback).toHaveBeenCalledOnce()
      })
      it('isPlaying is false: on click, calls resumePlayback', () => {
        render(<AudioFlashcardPaused />)
        screen.getAllByLabelText('Play/Pause')[0].click()
        expect(resumePlayback).toHaveBeenCalledOnce()
      })
    })
  })
})