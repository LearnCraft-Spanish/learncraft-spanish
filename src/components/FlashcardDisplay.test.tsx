import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { cleanup, render, renderHook, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { sampleStudentFlashcardData } from '../../tests/mockData'

import Flashcard from './FlashcardDisplay'

const example = { ...sampleStudentFlashcardData.examples[0], isCollected: true }
const audioExample = sampleStudentFlashcardData.examples.filter(example => example.spanishAudioLa.length)[0]

const incrementExampleNumber = vi.fn(() => {})
const onRemove = vi.fn(() => {})
const toggleAnswer = vi.fn()
const togglePlaying = vi.fn()

const queryClient = new QueryClient()

/*
  example: Flashcard
  isStudent: boolean
  answerShowing: boolean
  startWithSpanish?: boolean
  incrementExampleNumber: () => void
  onRemove: () => void
  toggleAnswer: () => void
  audioActive: string
  togglePlaying: () => void
  playing: boolean
*/

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
    // on click, answer showing is true
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

    describe('isStudent is true', () => {
      // The way we check isCollected is now different. We need to mock the function that checks if the flashcard is collected. (exampleIsCollected in useStudentFlashcards)
      describe('isCollected is true', () => {
        it('remove flashcard button is rendered', () => {
          expect(screen.getByText('Remove from my flashcards')).toBeTruthy()
        })
      })
      describe('isCollected is false', () => {
        it('add flashcard button is rendered', () => {
          expect(screen.getByText('Add to my flashcards')).toBeTruthy()
        })
      })
    })
  })
})
