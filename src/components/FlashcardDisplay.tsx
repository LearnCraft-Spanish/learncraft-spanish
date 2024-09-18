import React from 'react'
import type { Flashcard } from '../interfaceDefinitions'
import { formatEnglishText, formatSpanishText } from '../functions/formatFlashcardText'
import { useStudentFlashcards } from '../hooks/useStudentFlashcards'
import './Quiz.css'

interface FlashcardProps {
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
}

export default function FlashcardDisplay({ example, isStudent, answerShowing, incrementExampleNumber, audioActive, onRemove, playing, togglePlaying, startWithSpanish = false, toggleAnswer }: FlashcardProps): JSX.Element {
  const { addFlashcardMutation, removeFlashcardMutation, exampleIsCollected, exampleIsPending } = useStudentFlashcards()
  const addFlashcard = addFlashcardMutation.mutate
  const removeFlashcard = removeFlashcardMutation.mutate
  const spanishText = example.spanishExample
  const englishText = example.englishTranslation

  function addAndAdvance(example: Flashcard) {
    addFlashcard(example)
    incrementExampleNumber()
  }

  function removeAndAdvance(recordId: number) {
    removeFlashcard(recordId)
    onRemove()
  }

  function handlePlayPause(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    e.stopPropagation()
    togglePlaying()
  }

  const questionText = startWithSpanish ? () => formatSpanishText(example.spanglish, spanishText) : () => formatEnglishText(englishText)
  const answerText = startWithSpanish ? () => formatEnglishText(englishText) : () => formatSpanishText(example.spanglish, spanishText)

  return (
    <div className="flashcard" onClick={toggleAnswer} aria-label="flashcard">
      {!answerShowing && (
        <div className="englishTranslation">
          {questionText()}
        </div>
      )}
      {answerShowing && (
        <div className="spanishExample">
          {answerText()}
          {isStudent && !exampleIsCollected(example.recordId) && (
            <button
              type="button"
              className="addFlashcardButton"
              onClick={() =>
                addAndAdvance(
                  example,
                )}
            >
              Add to my flashcards
            </button>
          )}
          {isStudent
          && exampleIsCollected(example.recordId)
          && !exampleIsPending(example.recordId)
          && (
            <button
              type="button"
              className="removeFlashcardButton"
              onClick={() => removeAndAdvance(example.recordId)}
            >
              Remove from my flashcards
            </button>
          )}
          {isStudent
          && exampleIsCollected(example.recordId)
          && exampleIsPending(example.recordId)
          && (
            <button
              type="button"
              className="addFlashcardButton"
            >
              Adding to Flashcards...
            </button>
          )}
        </div>
      )}
      {/* Play/Pause */}
      {(audioActive) && (
        <button
          type="button"
          className="audioPlayPauseButton"
          onClick={e => handlePlayPause(e)}
        >
          <i className={playing ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
        </button>
      )}
    </div>
  )
}
