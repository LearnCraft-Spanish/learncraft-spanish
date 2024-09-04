import React from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
// import '@testing-library/jest-dom'

import { UserDataProvider } from '../contexts/UserDataContext.jsx'
import { ActiveStudentProvider } from '../contexts/ActiveStudentContext.jsx'
import { sampleStudentFlashcardData } from '../../tests/mockData.js'
import type { Flashcard } from '../interfaceDefinitions'

import SRSQuizButtons from './SRSButtons'

// These examples could be defined in a better way
const currentExample: Flashcard = { ...sampleStudentFlashcardData.examples[0] }
currentExample.isCollected = true

const currentExampleEasy: Flashcard = { ...sampleStudentFlashcardData.examples[0] }
currentExampleEasy.difficulty = 'easy'
currentExample.isCollected = true

const currentExampleHard: Flashcard = { ...sampleStudentFlashcardData.examples[0] }
currentExampleHard.difficulty = 'hard'
currentExample.isCollected = true

const updateExampleDifficulty = vi.fn(() => {})
const incrementExampleNumber = vi.fn(() => {})

describe('component SRSButtons', () => {
  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('example difficulty is labeled hard, displays Labeled: Easy', () => {
    render(
      <UserDataProvider>
        <ActiveStudentProvider>
          <SRSQuizButtons
            currentExample={currentExampleEasy}
            answerShowing={false}
            updateExampleDifficulty={updateExampleDifficulty}
            incrementExampleNumber={incrementExampleNumber}
          />
        </ActiveStudentProvider>
      </UserDataProvider>,
    )
    expect(screen.getByText('Labeled: Easy')).toBeTruthy()
  })
  it('example difficulty is labeled hard, displays Labeled: Hard', () => {
    render(
      <UserDataProvider>
        <ActiveStudentProvider>
          <SRSQuizButtons
            currentExample={currentExampleHard}
            answerShowing={false}
            updateExampleDifficulty={updateExampleDifficulty}
            incrementExampleNumber={incrementExampleNumber}
          />
        </ActiveStudentProvider>
      </UserDataProvider>,
    )
    expect(screen.getByText('Labeled: Hard')).toBeTruthy()
  })

  it('answer showing and no difficulty set, shows setting buttons', () => {
    render(
      <UserDataProvider>
        <ActiveStudentProvider>
          <SRSQuizButtons
            currentExample={currentExample}
            answerShowing
            updateExampleDifficulty={updateExampleDifficulty}
            incrementExampleNumber={incrementExampleNumber}
          />
        </ActiveStudentProvider>
      </UserDataProvider>,
    )
    expect(screen.getByText('This was easy')).toBeTruthy()
    expect(screen.getByText('This was hard')).toBeTruthy()
  })

  /*
  Future Testing:
  - Test the onClick events for the buttons (unsure how to do it currently, as the functions passed in are called withen the component's own functions)
  */
})
