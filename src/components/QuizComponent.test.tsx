import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'

import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { sampleStudentFlashcardData } from '../../tests/mockData'

import Quiz from './QuizComponent'

const queryClient = new QueryClient()

const addFlashcard = vi.fn()
const removeFlashcard = vi.fn()
const cleanupFunction = vi.fn()

vi.mock('../contexts/UserDataContext')
vi.mock('../contexts/ActiveStudentContext')

// vi.mock('../hooks/useStudentFlashcards', () => {
//   return {
//     useStudentFlashcards: () => ({
//       flashcardDataQuery: { data: sampleStudentFlashcardData },
//       exampleIsCollected: { data: vi.fn(() => false) },
//     }),
//   }
// })
/*
  quizTitle,
  examplesToParse,
  startWithSpanish = false,
  quizOnlyCollectedExamples = false,
  isSrsQuiz = false,
  cleanupFunction,
  quizLength = 1000,
  */
function renderQuizNoSrs() {
  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Quiz
          quizTitle="Test Quiz"
          examplesToParse={sampleStudentFlashcardData.examples}
          // startWithSpanish={false}
          // quizOnlyCollectedExamples={false}
          // isSrsQuiz={false}
          cleanupFunction={cleanupFunction}
          // quizLength={1000}
        />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}
function renderQuizYesSrs() {
  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Quiz
          quizTitle="Test Quiz"
          examplesToParse={sampleStudentFlashcardData.examples}
          // startWithSpanish={false}
          quizOnlyCollectedExamples
          isSrsQuiz
          cleanupFunction={cleanupFunction}
          // quizLength={1000}
        />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('component Quiz', () => {
  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('renders', () => {
    const quizTitle = 'Test Quiz'
    renderQuizNoSrs()
    // expect a div with class="quiz"
    expect(screen.getByText(quizTitle)).toBeTruthy()
  })

  it('calls cleanupFunction on unmount', () => {
    renderQuizNoSrs()
    act(() => {
      screen.getByText('Back').click()
    })
    expect(cleanupFunction).toHaveBeenCalledOnce()
  })

  it('changes flashcard on next button click', () => {
    renderQuizNoSrs()
    // Find the flashcard element
    // Get the initial text content of the flashcard 
    const flashcard = screen.getByLabelText('flashcard')
    const initialText = flashcard.textContent

    // Simulate a click on the flashcard
    act(() => {
      fireEvent.click(flashcard)
    })

    // Find the next button
    const nextButton = screen.getByRole('button', { name: 'Next' })

    // Simulate a click on the next button
    act(() => {
      fireEvent.click(nextButton)
    })

    // Find the flashcard element again
    const flashcard2 = screen.getByLabelText('flashcard')

    // Assert that the flashcard text content has changed
    expect(flashcard2.textContent).not.toBe(initialText)
  })
  it('changes flashcard to previous on previous button click', () => {
    renderQuizNoSrs()
    // Find the flashcard element
    const flashcard = screen.getByLabelText('flashcard')
    // Get the initial text content of the flashcard
    const initialText = flashcard.textContent

    // Simulate a click on the flashcard
    act(() => {
      fireEvent.click(flashcard)
    })

    // Find the next button
    const nextButton = screen.getByRole('button', { name: 'Next' })

    // Simulate a click on the next button
    act(() => {
      fireEvent.click(nextButton)
    })
    const flashcardNext = screen.getByLabelText('flashcard')
    const nextTest = flashcardNext.textContent
    // Find the previous button
    const previousButton = screen.getByRole('button', { name: 'Previous' })

    // Simulate a click on the previous button
    act(() => {
      fireEvent.click(previousButton)
    })

    // Find the flashcard element again
    const flashcardPrevious = screen.getByLabelText('flashcard')

    // Assert that the flashcard text content has changed
    expect(flashcardPrevious.textContent).toBe(initialText)
    expect(flashcardPrevious.textContent).not.toBe(nextTest)
  })

  describe.skip('isSrsQuiz is true', () => {
    it('renders SrsButtons when isSrsQuiz is true', () => {
      renderQuizYesSrs()
      const flashcard = screen.getByLabelText('flashcard')
      act(() => {
        fireEvent.click(flashcard)
      })
      const hardBtn = screen.getByRole('button', { name: 'This was hard' })
      const easyBtn = screen.getByRole('button', { name: 'This was easy' })

      expect(hardBtn).toBeTruthy()
      expect(easyBtn).toBeTruthy()
    })
  })
})
