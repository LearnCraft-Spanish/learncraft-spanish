import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { sampleMyExamples, sampleStudent } from '../../tests/mockData.js'
import type { Flashcard } from '../interfaceDefinitions'
import SRSQuizButtons from './SRSButtons'

const sampleFlashcard: Flashcard = { ...sampleMyExamples.examples[0] }
sampleFlashcard.difficulty = 'easy'
sampleFlashcard.isCollected = true

const sampleStudentExample = { ...sampleMyExamples.studentExamples }

describe('component SRSButtons', () => {
  it('should render correctly', () => {
    const props = {
      currentExample: sampleFlashcard,
      studentExamples: sampleStudentExample,
      userData: sampleStudent,
      answerShowing: false,
      examples: [...sampleMyExamples.examples],
      onExampleSelect: () => {},
      onAnswerSubmit: () => {},
      updateExampleDifficulty: () => {},
      incrementExampleNumber: () => {},
      getAccessToken: () => new Promise<string>(() => {}),
    }
    render(<SRSQuizButtons {...props} />)
  })
})
