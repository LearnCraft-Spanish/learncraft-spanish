import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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
const addFlashcardAndUpdate = vi.fn((recordId: number) => {})
const removeFlashcardAndUpdate = vi.fn((recordId: number) => {})
const toggleAnswer = vi.fn()
const hideAnswer = vi.fn()

function FlashcardSpanishFirst() {
  return <Flashcard example={example} isStudent answerShowing={false} startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} hideAnswer={hideAnswer} />
}
function FlashcardEnglishFirst() {
  return <Flashcard example={example} isStudent answerShowing={false} startWithSpanish={false} addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} hideAnswer={hideAnswer} />
}
function FlashcardSpanishFirstAnswerShowing() {
  return <Flashcard example={example} isStudent answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} hideAnswer={hideAnswer} />
}
function FlashcardEnglishFirsAnswerShowing() {
  return <Flashcard example={example} isStudent answerShowing startWithSpanish={false} addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} hideAnswer={hideAnswer} />
}

describe('component Flashcard', () => {
  // beforeEach(() => {
  //   // render flashcard with spanish first
  //   render(<Flashcard example={example} isStudent answerShowing={false} startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} hideAnswer={hideAnswer} />)
  // })
  describe('answer showing is false', () => {
    it('renders correctly, spanish first', () => {
      render(<FlashcardSpanishFirst />)
      expect(screen.getByText('Hola')).toBeTruthy()
      expect(screen.queryByText('Hello')).toBeNull()
    })
    it('renders correctly, english first', () => {
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
    describe('isStudent is true', () => {
      it('example.isKnown is true, Remove flashcard button is rendered', () => {
        render(<Flashcard example={example} isStudent answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} hideAnswer={hideAnswer} />)
        expect(screen.getByText('Remove from my flashcards')).toBeTruthy()
      })
      it('example.isKnown is false, Add flashcard button is rendered', () => {
        render(<Flashcard example={{ ...example, isKnown: false }} isStudent answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} hideAnswer={hideAnswer} />)
        expect(screen.getByText('Add to my flashcards')).toBeTruthy()
      })
    })
    describe('isStudent is false', () => {
      it('add and remove flashcard buttons are not rendered', () => {
        render(<Flashcard example={example} isStudent={false} answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} hideAnswer={hideAnswer} />)
        expect(screen.queryByText('Add to my flashcards')).toBeNull()
        expect(screen.queryByText('Remove from my flashcards')).toBeNull()
      })
    })

    describe('answer is showing AND isStudent is false', () => {
      it('add flashcard and remove flashcard are not rendered', () => {
        render(<Flashcard example={example} isStudent={false} answerShowing startWithSpanish addFlashcardAndUpdate={addFlashcardAndUpdate} removeFlashcardAndUpdate={removeFlashcardAndUpdate} toggleAnswer={toggleAnswer} hideAnswer={hideAnswer} />)
        expect(screen.queryByText('Add to my flashcards')).toBeNull()
        expect(screen.queryByText('Remove from my flashcards')).toBeNull()
      })
      // it('renders correctly, english first', () => {
      //   render(<FlashcardEnglishFirsAnswerShowing />)
      //   expect(screen.getByText('Hola')).toBeTruthy()
      //   expect(screen.queryByText('Hello')).toBeNull()
      // })
    })
  })
})
