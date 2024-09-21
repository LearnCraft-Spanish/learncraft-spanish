import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { sampleStudentFlashcardData } from '../../tests/mockData.js'
import type { Flashcard } from '../interfaceDefinitions'

import SRSQuizButtons from './SRSButtons'

const queryClient = new QueryClient()

vi.mock('../hooks/useStudentFlashcards', () => {
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

const incrementExampleNumber = vi.fn(() => {})

describe('component SRSButtons', () => {
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
})
