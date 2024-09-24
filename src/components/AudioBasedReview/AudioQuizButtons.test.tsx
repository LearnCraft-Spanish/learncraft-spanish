import { describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import AudioQuizButtons from './AudioQuizButtons'
/*
  audioOrComprehension: 'audio' | 'comprehension'
  // currentStep: 'question' | 'guess' | 'hint' | 'answer'
  currentStep: string
  incrementCurrentStep: () => void
  autoplay: boolean
  // customIncrementCurrentStep: (step: 'question' | 'guess' | 'hint' | 'answer') => void
  customIncrementCurrentStep: (step: string) => void
  decrementExample: () => void
  incrementExample: () => void
  unReadyQuiz: () => void
*/
const incrementCurrentStep = vi.fn()
const customIncrementCurrentStep = vi.fn()
const decrementExample = vi.fn()
const incrementExample = vi.fn()
const unReadyQuiz = vi.fn()
describe('component AudioQuizButtons', () => {
  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('renders without crashing', () => {
    render(
      <AudioQuizButtons
        audioOrComprehension="audio"
        currentStep="question"
        incrementCurrentStep={incrementCurrentStep}
        autoplay
        customIncrementCurrentStep={customIncrementCurrentStep}
        decrementExample={decrementExample}
        incrementExample={incrementExample}
        unReadyQuiz={unReadyQuiz}
      />,
    )
    expect(screen.getByText('Previous')).toBeTruthy()
    expect(screen.getByText('Next')).toBeTruthy()
    expect(screen.getByText('Back')).toBeTruthy()
  })
})
