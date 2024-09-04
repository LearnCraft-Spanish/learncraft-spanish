import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { sampleStudentFlashcardData } from '../../tests/mockData'

import Flashcard from './Flashcard'

const example = { ...sampleStudentFlashcardData.examples[0], isCollected: true }

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
function FlashcardEnglishFirstAnswerShowing() {
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
      toggleAnswer()
      expect(screen.getByText(example.spanishExample)).toBeTruthy()
      expect(screen.queryByText(example.englishTranslation)).toBeNull()
    })
    // on click, answer showing is false
    it('on click, calls toggleAnswer function', () => {
      render(<FlashcardSpanishFirstAnswerShowing />)
      toggleAnswer()
      screen.getByText(example.englishTranslation).click()
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
      describe('isCollected is true', () => {
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
      describe('isCollected is false', () => {
        it('add flashcard button is rendered', () => {
          render(<Flashcard example={{ ...example, isCollected: false }} isStudent answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} />)
          expect(screen.getByText('Add to my flashcards')).toBeTruthy()
        })
        it('on click, calls addFlashcardAndUpdate function', () => {
          render(<Flashcard example={{ ...example, isCollected: false }} isStudent answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} />)
          screen.getByText('Add to my flashcards').click()
          expect(addFlashcardAndUpdate).toHaveBeenCalled()
        })
      })
    })
  })
})
