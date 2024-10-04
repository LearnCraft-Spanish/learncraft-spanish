import type { Flashcard } from '../../interfaceDefinitions'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'

import React from 'react'
import { vi } from 'vitest'
import { sampleStudentFlashcardData } from '../../../tests/mockData'

import SRSQuizButtons from './SRSButtons'

const queryClient = new QueryClient()

vi.mock('../../hooks/useStudentFlashcards', () => {
  return {
    useStudentFlashcards: () => ({
      flashcardDataQuery: { data: sampleStudentFlashcardData },
      updateFlashcardMutation: { mutate: vi.fn() },
    }),
  }
})
// These examples could be defined in a better way
const currentExample: Flashcard = { ...sampleStudentFlashcardData.examples[0] }

const currentExampleEasy: Flashcard = { ...currentExample, difficulty: 'easy' }

const currentExampleHard: Flashcard = { ...currentExample, difficulty: 'hard' }

// const incrementExampleNumber = vi.fn(() => {})
let incrementExampleNumber = vi.fn()

describe('component SRSButtons', () => {
  beforeAll(() => {
    incrementExampleNumber = vi.fn(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('example difficulty is labeled hard, displays Labeled: Easy', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SRSQuizButtons
          currentExample={currentExampleEasy}
          answerShowing={false}
          incrementExampleNumber={incrementExampleNumber}
        />
      </QueryClientProvider>,
    )
    expect(screen.getByText('Labeled: Easy')).toBeTruthy()
  })
  it('example difficulty is labeled hard, displays Labeled: Hard', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SRSQuizButtons
          currentExample={currentExampleHard}
          answerShowing={false}
          incrementExampleNumber={incrementExampleNumber}
        />
      </QueryClientProvider>,
    )
    expect(screen.getByText('Labeled: Hard')).toBeTruthy()
  })

  it('answer showing and no difficulty set, shows setting buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SRSQuizButtons
          currentExample={currentExample}
          answerShowing
          incrementExampleNumber={incrementExampleNumber}
        />
      </QueryClientProvider>,
    )
    expect(screen.getByText('This was easy')).toBeTruthy()
    expect(screen.getByText('This was hard')).toBeTruthy()
  })

  /*
  Future Testing:
  - Test the onClick events for the buttons (unsure how to do it currently, as the functions passed in are called withen the component's own functions)
  */
  describe('onClick functions', () => {
    it('increaseDifficulty', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <SRSQuizButtons
            currentExample={currentExample}
            answerShowing
            incrementExampleNumber={incrementExampleNumber}
          />
        </QueryClientProvider>,
      )
      screen.getByText('This was hard').click()
      expect(incrementExampleNumber).toHaveBeenCalled()
    })
    it('decreaseDifficulty', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <SRSQuizButtons
            currentExample={currentExample}
            answerShowing
            incrementExampleNumber={incrementExampleNumber}
          />
        </QueryClientProvider>,
      )
      screen.getByText('This was easy').click()
      expect(incrementExampleNumber).toHaveBeenCalled()
    })
  })
  describe('handing of undefined values', () => {
    it('doesnt call incrementExample when error finding relatedExample', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <SRSQuizButtons
            currentExample={{ ...currentExample, recordId: 999 }}
            answerShowing
            incrementExampleNumber={incrementExampleNumber}
          />
        </QueryClientProvider>,
      )
      screen.getByText('This was easy').click()
      expect(incrementExampleNumber).not.toHaveBeenCalled()
      screen.getByText('This was hard').click()
      expect(incrementExampleNumber).not.toHaveBeenCalled()
    })
  })
})
