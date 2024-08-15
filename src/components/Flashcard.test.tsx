import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import Flashcard from './Flashcard'

const example = {
  recordId: 1,
  spanishExample: 'Hola',
  englishTranslation: 'Hello',
  spanglish: 'esp',
  vocabIncluded: [],
  allStudents: [],
  englishAudio: '',
  spanishAudioLa: '',
  vocabComplete: false,
  isKnown: true,
}

// create a vi.fn that takes in a number and returns void
//
const addFlashcardAndUpdate = vi.fn(() => {})
const removeFlashcardAndUpdate = vi.fn(() => {})
const toggleAnswer = vi.fn()

function FlashcardSpanishFirst() {
  return <Flashcard example={example} isStudent answerShowing={false} startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} />
}
function FlashcardEnglishFirst() {
  return <Flashcard example={example} isStudent answerShowing={false} startWithSpanish={false} addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} />
}
function FlashcardSpanishFirstAnswerShowing() {
  return <Flashcard example={example} isStudent answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} />
}
function FlashcardEnglishFirsAnswerShowing() {
  return <Flashcard example={example} isStudent answerShowing startWithSpanish={false} addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} />
}

describe('component Flashcard', () => {
  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })
  describe('answer showing is false', () => {
    it('renders correctly, spanish shown first', () => {
      render(<FlashcardSpanishFirst />)
      expect(screen.getByText('Hola')).toBeTruthy()
      expect(screen.queryByText('Hello')).toBeNull()
    })
    it('renders correctly, english shown first', () => {
      render(<FlashcardEnglishFirst />)
      expect(screen.getByText('Hello')).toBeTruthy()
      expect(screen.queryByText('Hola')).toBeNull()
    })
    // on click, answer showing is true
    it('on click, calls toggleAnswer function', () => {
      render(<FlashcardSpanishFirst />)
      screen.getByText('Hola').click()
      expect(toggleAnswer).toHaveBeenCalled()
    })
  })

  describe('answer showing is true', () => {
    it('renders correctly, spanish first', () => {
      render(<FlashcardSpanishFirstAnswerShowing />)
      expect(screen.getByText('Hello')).toBeTruthy()
      expect(screen.queryByText('Hola')).toBeNull()
    })
    it('renders correctly, english first', () => {
      render(<FlashcardEnglishFirsAnswerShowing />)
      toggleAnswer()
      expect(screen.getByText('Hola')).toBeTruthy()
      expect(screen.queryByText('Hello')).toBeNull()
    })
    // on click, answer showing is false
    it('on click, calls toggleAnswer function', () => {
      render(<FlashcardSpanishFirstAnswerShowing />)
      toggleAnswer()
      screen.getByText('Hello').click()
      expect(toggleAnswer).toHaveBeenCalled()
    })

    describe('isStudent is false', () => {
      it('add and remove flashcard buttons are not rendered', () => {
        render(<Flashcard example={example} isStudent={false} answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} />)
        expect(screen.queryByText('Add to my flashcards')).toBeNull()
        expect(screen.queryByText('Remove from my flashcards')).toBeNull()
      })
    })

    describe('isStudent is true', () => {
      describe('isKnown is true', () => {
        it('remove flashcard button is rendered', () => {
          render(<Flashcard example={example} isStudent answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} />)
          expect(screen.getByText('Remove from my flashcards')).toBeTruthy()
        })
        it('on click, calls removeFlashcardAndUpdate function', () => {
          render(<Flashcard example={example} isStudent answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} />)
          screen.getByText('Remove from my flashcards').click()
          expect(removeFlashcardAndUpdate).toHaveBeenCalled()
        })
      })
      describe('isKnown is false', () => {
        it('add flashcard button is rendered', () => {
          render(<Flashcard example={{ ...example, isKnown: false }} isStudent answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} />)
          expect(screen.getByText('Add to my flashcards')).toBeTruthy()
        })
        it('on click, calls addFlashcardAndUpdate function', () => {
          render(<Flashcard example={{ ...example, isKnown: false }} isStudent answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} />)
          screen.getByText('Add to my flashcards').click()
          expect(addFlashcardAndUpdate).toHaveBeenCalled()
        })
      })
    })
  })
})
