import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import type { Flashcard } from '../interfaceDefinitions'
import { sampleMyExamples, sampleStudent } from '../../tests/mockData.js'
import { UserDataProvider } from '../contexts/UserDataContext.jsx'
import { ActiveStudentProvider } from '../contexts/ActiveStudentContext.jsx'
import { useUserData } from '../hooks/useUserData.js'
import SRSQuizButtons from './SRSButtons'

// const sampleStudentExample = { ...sampleMyExamples.studentExamples }

const currentExample: Flashcard = { ...sampleMyExamples.examples[0] }
// currentExample.difficulty = 'easy'
currentExample.isCollected = true

const currentExampleEasy: Flashcard = { ...sampleMyExamples.examples[0] }
currentExampleEasy.difficulty = 'easy'
currentExample.isCollected = true

const currentExampleHard: Flashcard = { ...sampleMyExamples.examples[0] }
currentExampleHard.difficulty = 'hard'
currentExample.isCollected = true

const updateExampleDifficulty = vi.fn(() => {})
const incrementExampleNumber = vi.fn(() => {})

/*
SRSQuizButtons Props:

  currentExample: Flashcard
  answerShowing: boolean
  updateExampleDifficulty: (recordId: number, difficulty: string) => void
  incrementExampleNumber: () => void

Defined Inside SRSQuizButtons:

  const { userData } = useUserData()
  const { studentFlashcardData } = useActiveStudent()
  const {
    updateMyStudentExample,
    updateStudentExample,
  } = useBackend()
*/

describe('component SRSButtons', () => {
  afterEach(() => {
    vi.clearAllMocks()
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
  it('click easy button, calls updateExampleDifficulty with easy', () => {
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
    const easyButton = screen.getByText('This was easy')
    easyButton.click()
    expect(updateExampleDifficulty).toHaveBeenCalledOnce()
  })
})

/*      Need userData context working to test this Component      */
// describe.skip('component SRSButtons', () => {
//   it('should render correctly', () => {
//     const props = {
//       currentExample: sampleFlashcard,
//       studentExamples: sampleStudentExample,
//       userData: sampleStudent,
//       answerShowing: false,
//       examples: [...sampleMyExamples.examples],
//       onExampleSelect: () => {},
//       onAnswerSubmit: () => {},
//       updateExampleDifficulty: () => {},
//       incrementExampleNumber: () => {},
//       getAccessToken: () => new Promise<string>(() => {}),
//     }
//     render(<SRSQuizButtons {...props} />)
//   })
// })
