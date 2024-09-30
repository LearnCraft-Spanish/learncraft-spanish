import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { sampleStudentFlashcardData } from '../../../tests/mockData'
import { useStudentFlashcards } from '../../hooks/useStudentFlashcards'

import Flashcard from './FlashcardDisplay'

const example = { ...sampleStudentFlashcardData.examples[0], isCollected: true }
const audioExample = sampleStudentFlashcardData.examples.filter(example => example.spanishAudioLa.length)[0]

const incrementExampleNumber = vi.fn(() => {})
const onRemove = vi.fn(() => {})
const toggleAnswer = vi.fn()
const togglePlaying = vi.fn()

const queryClient = new QueryClient()

vi.mock('../../hooks/useStudentFlashcards', () => ({
  useStudentFlashcards: () => ({
    addFlashcardMutation: { mutate: vi.fn() },
    removeFlashcardMutation: { mutate: vi.fn() },
    exampleIsCollected: vi.fn((x: number) => x === example.recordId),
    exampleIsPending: vi.fn((x: number) => x < 0),
  }),
}))

function FlashcardSpanishFirst() {
  return (
    <QueryClientProvider client={queryClient}>
      <Flashcard example={example} isStudent answerShowing={false} startWithSpanish incrementExampleNumber={incrementExampleNumber} onRemove={onRemove} toggleAnswer={toggleAnswer} audioActive="" togglePlaying={togglePlaying} playing={false} />
    </QueryClientProvider>
  )
}
function FlashcardEnglishFirst() {
  return (
    <QueryClientProvider client={queryClient}>
      <Flashcard example={example} isStudent answerShowing={false} startWithSpanish={false} incrementExampleNumber={incrementExampleNumber} onRemove={onRemove} toggleAnswer={toggleAnswer} audioActive="" togglePlaying={togglePlaying} playing={false} />
    </QueryClientProvider>
  )
}
function FlashcardSpanishFirstAnswerShowing() {
  return (
    <QueryClientProvider client={queryClient}>
      <Flashcard example={example} isStudent answerShowing startWithSpanish incrementExampleNumber={incrementExampleNumber} onRemove={onRemove} toggleAnswer={toggleAnswer} audioActive="" togglePlaying={togglePlaying} playing={false} />
    </QueryClientProvider>
  )
}
function FlashcardEnglishFirstAnswerShowing() {
  return (
    <QueryClientProvider client={queryClient}>
      <Flashcard example={example} isStudent answerShowing startWithSpanish={false} incrementExampleNumber={incrementExampleNumber} onRemove={onRemove} toggleAnswer={toggleAnswer} audioActive="" togglePlaying={togglePlaying} playing={false} />
    </QueryClientProvider>
  )
}

function FlashcardSpanishFirstNotStudent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Flashcard example={example} isStudent={false} answerShowing={false} startWithSpanish incrementExampleNumber={incrementExampleNumber} onRemove={onRemove} toggleAnswer={toggleAnswer} audioActive="" togglePlaying={togglePlaying} playing={false} />
    </QueryClientProvider>
  )
}

function FlashcardWithAudio() {
  return (
    <QueryClientProvider client={queryClient}>
      <Flashcard example={audioExample} isStudent answerShowing={false} startWithSpanish incrementExampleNumber={incrementExampleNumber} onRemove={onRemove} toggleAnswer={toggleAnswer} audioActive="active" togglePlaying={togglePlaying} playing={false} />
    </QueryClientProvider>
  )
}

describe('component Flashcard', () => {
  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('on click, calls toggle answer', () => {
    render(<FlashcardSpanishFirst />)
    // toggleAnswer()
    screen.getByText(example.spanishExample).click()
    expect(toggleAnswer).toHaveBeenCalled()
  })

  describe('audio is active', () => {
    it('renders correctly', () => {
      render(<FlashcardWithAudio />)
      expect(screen.getAllByLabelText('Play/Pause')).toBeTruthy()
    })
    it('on click, calls togglePlaying', () => {
      render(<FlashcardWithAudio />)
      screen.getAllByLabelText('Play/Pause')[0].click()
      expect(togglePlaying).toHaveBeenCalled()
    })
    it('on click, does NOT propagate to also call toggleAnswer', () => {
      render(<FlashcardWithAudio />)
      screen.getAllByLabelText('Play/Pause')[0].click()
      expect(toggleAnswer).not.toHaveBeenCalled()
    })
  })

  describe('answer showing is false', () => {
    it('renders correctly, spanish shown first', () => {
      render(<FlashcardSpanishFirst />)
      expect(screen.getByText(example.spanishExample)).toBeTruthy()
      expect(screen.queryByText(example.englishTranslation)).toBeNull()
    })
    it('renders correctly, english shown first', () => {
      render(<FlashcardEnglishFirst />)
      expect(screen.getByText(example.englishTranslation)).toBeTruthy()
      expect(screen.queryByText(example.spanishExample)).toBeNull()
    })
    it('on click, calls toggleAnswer function', () => {
      render(<FlashcardSpanishFirst />)
      screen.getByText(example.spanishExample).click()
      expect(toggleAnswer).toHaveBeenCalled()
    })
  })

  describe('answer showing is true', () => {
    it('renders correctly, spanish first', () => {
      render(<FlashcardSpanishFirstAnswerShowing />)
      expect(screen.getByText(example.englishTranslation)).toBeTruthy()
      expect(screen.queryByText(example.spanishExample)).toBeNull()
    })
    it('renders correctly, english first', () => {
      render(<FlashcardEnglishFirstAnswerShowing />)
      expect(screen.getByText(example.spanishExample)).toBeTruthy()
      expect(screen.queryByText(example.englishTranslation)).toBeNull()
    })
    describe('isStudent is false', () => {
      it('add and remove flashcard buttons are not rendered', () => {
        render(<FlashcardSpanishFirstNotStudent />)
        expect(screen.queryByText('Add to my flashcards')).toBeNull()
        expect(screen.queryByText('Remove from my flashcards')).toBeNull()
      })
    })
  })
})
