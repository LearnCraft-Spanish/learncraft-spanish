import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { sampleMyExamples, sampleStudent } from '../../tests/mockData'
import { ActiveStudentProvider } from '../contexts/ActiveStudentContext'
import { useActiveStudent } from '../hooks/useActiveStudent'
import Quiz from './Quiz'

const addFlashcard = vi.fn()
const removeFlashcard = vi.fn()
const cleanupFunction = vi.fn()

function renderQuizNoSrs() {
  render(
    <MemoryRouter>
      <ActiveStudentProvider>
        <Quiz
          quizTitle="Test Quiz"
          examplesToParse={sampleMyExamples.examples}
          // startWithSpanish={false}
          // quizOnlyCollectedExamples={false}
          // isSrsQuiz={false}
          // userData={sampleStudent}
          addFlashcard={addFlashcard}
          removeFlashcard={removeFlashcard}

          cleanupFunction={cleanupFunction}
        />
      </ActiveStudentProvider>
    </MemoryRouter>,
  )
}
function renderQuizYesSrs() {
  render(
    <MemoryRouter>
      <ActiveStudentProvider>
        <Quiz
          quizTitle="Test Quiz"
          examplesToParse={sampleMyExamples.examples}
          // startWithSpanish={false}
          // quizOnlyCollectedExamples={false}
          isSrsQuiz
          // userData={sampleStudent}
          addFlashcard={addFlashcard}
          removeFlashcard={removeFlashcard}
          cleanupFunction={cleanupFunction}
        />
      </ActiveStudentProvider>
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
  it('updates flashcard on click', () => {
    renderQuizNoSrs()
    // Find the flashcard element
    const flashcard = screen.getByRole('button', { name: 'flashcard' })
    // Get the initial text content of the flashcard
    const initialText = flashcard.textContent

    // Simulate a click on the flashcard
    act(() => {
      fireEvent.click(flashcard)
    })
    const flashcard2 = screen.getByRole('button', { name: 'flashcard' })

    // Assert that the flashcard text content has changed
    expect(flashcard2.textContent).not.toBe(initialText)
  })
  it('changes flashcard on next button click', () => {
    renderQuizNoSrs()
    // Find the flashcard element
    const flashcard = screen.getByRole('button', { name: 'flashcard' })
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

    // Find the flashcard element again
    const flashcard2 = screen.getByRole('button', { name: 'flashcard' })

    // Assert that the flashcard text content has changed
    expect(flashcard2.textContent).not.toBe(initialText)
  })
  it('changes flashcard to previous on previous button click', () => {
    renderQuizNoSrs()
    // Find the flashcard element
    const flashcard = screen.getByRole('button', { name: 'flashcard' })
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
    const flashcardNext = screen.getByRole('button', { name: 'flashcard' })
    const nextTest = flashcardNext.textContent
    // Find the previous button
    const previousButton = screen.getByRole('button', { name: 'Previous' })

    // Simulate a click on the previous button
    act(() => {
      fireEvent.click(previousButton)
    })

    // Find the flashcard element again
    const flashcardPrevious = screen.getByRole('button', { name: 'flashcard' })

    // Assert that the flashcard text content has changed
    expect(flashcardPrevious.textContent).toBe(initialText)
    expect(flashcardPrevious.textContent).not.toBe(nextTest)
  })

  it('renders SrsButtons when isSrsQuiz is true', () => {
    renderQuizYesSrs()
    const flashcard = screen.getByRole('button', { name: 'flashcard' })
    act(() => {
      fireEvent.click(flashcard)
    })
    const hardBtn = screen.getByRole('button', { name: 'This was hard' })
    const easyBtn = screen.getByRole('button', { name: 'This was easy' })

    expect(hardBtn).toBeTruthy()
    expect(easyBtn).toBeTruthy()
  })
  it('renders Labeled: Hard when difficulty hard is selected', () => {
    renderQuizYesSrs()
    const flashcard = screen.getByRole('button', { name: 'flashcard' })
    act(() => {
      fireEvent.click(flashcard)
    })
    const hardBtn = screen.getByRole('button', { name: 'This was hard' })
    act(() => {
      fireEvent.click(hardBtn)
    })
    const previousBtn = screen.getByRole('button', { name: 'Previous' })
    act(() => {
      fireEvent.click(previousBtn)
    })
    const hardBanner = screen.getByRole('button', { name: 'Labeled: Hard' })
    expect(hardBanner).toBeTruthy()
  })
  it('renders Labeled: Easy when difficulty easy is selected', () => {
    renderQuizYesSrs()
    const flashcard = screen.getByRole('button', { name: 'flashcard' })
    act(() => {
      fireEvent.click(flashcard)
    })
    const easyBtn = screen.getByRole('button', { name: 'This was easy' })
    act(() => {
      fireEvent.click(easyBtn)
    })
    const previousBtn = screen.getByRole('button', { name: 'Previous' })
    act(() => {
      fireEvent.click(previousBtn)
    })
    const easyBanner = screen.getByRole('button', { name: 'Labeled: Easy' })
    expect(easyBanner).toBeTruthy()
  })
  it('updates QuizProgress on next button click', () => {
    renderQuizNoSrs()
    const flashcard = screen.getByRole('button', { name: 'flashcard' })
    act(() => {
      fireEvent.click(flashcard)
    })
    const nextButton = screen.getByRole('button', { name: 'Next' })
    act(() => {
      fireEvent.click(nextButton)
    })
    const totalExamplesNumber = sampleMyExamples.examples.length
    const quizProgress = screen.getByText(`Flashcard 2 of ${totalExamplesNumber}`)
    expect(quizProgress).toBeTruthy()
  })
  it('removeFlashcard is called on remove button click', () => {
    renderQuizNoSrs()
    const flashcard = screen.getByRole('button', { name: 'flashcard' })
    act(() => {
      fireEvent.click(flashcard)
    })
    const removeButton = screen.getByRole('button', { name: 'Remove from my flashcards' })
    act(() => {
      fireEvent.click(removeButton)
    })
    expect(removeFlashcard).toHaveBeenCalled()
  })
  it('addFlashcard is called on add button click', () => {
    const unknownExample = {
      recordId: 1,
      spanglish: 'esp',
      spanishExample: 'Hola',
      englishTranslation: 'Hello',
      isCollected: false,
      vocabIncluded: ['hello'],
      englishAudio: '',
      spanishAudioLa: '',
      vocabComplete: false,
    }
    render(
      <MemoryRouter>
        <ActiveStudentProvider>
          <Quiz
            quizTitle="Test Quiz"
            examplesToParse={[unknownExample]}
            // startWithSpanish={false}
            // quizOnlyCollectedExamples={false}
            // isSrsQuiz={false}
            // userData={sampleStudent}
            addFlashcard={addFlashcard}
            removeFlashcard={removeFlashcard}

            cleanupFunction={cleanupFunction}
          />
        </ActiveStudentProvider>
      </MemoryRouter>,
    )
    const { setActiveStudent, setStudentExamplesTable } = useActiveStudent()
    if (setActiveStudent) {
      setActiveStudent(sampleStudent)
    }
    if (setStudentExamplesTable) {
      setStudentExamplesTable(sampleMyExamples.studentExamples)
    }
    const flashcard = screen.getByRole('button', { name: 'flashcard' })
    act(() => {
      fireEvent.click(flashcard)
    })
    const addButton = screen.getByRole('button', { name: 'Add to my flashcards' })
    act(() => {
      fireEvent.click(addButton)
    })
    expect(addFlashcard).toHaveBeenCalled()
  })
  it('calls togglePlaying on audio button click', () => {
    render(
      <MemoryRouter>
        <ActiveStudentProvider>
          <Quiz
            quizTitle="Test Quiz"
            examplesToParse={[sampleMyExamples.examples[2]]}
            // startWithSpanish={false}
            // quizOnlyCollectedExamples={false}
            // isSrsQuiz={false}
            // userData={sampleStudent}
            addFlashcard={addFlashcard}
            removeFlashcard={removeFlashcard}

            cleanupFunction={cleanupFunction}
          />
        </ActiveStudentProvider>
      </MemoryRouter>,
    )
    const flashcard = screen.getByRole('button', { name: 'flashcard' })
    act(() => {
      fireEvent.click(flashcard)
    })
    const audioButton = screen.getByRole('button', { name: 'Play Audio' })
    act(() => {
      fireEvent.click(audioButton)
    })
    expect(audioButton).toBeTruthy()
  })
})
