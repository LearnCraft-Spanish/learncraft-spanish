import React from 'react'
import type { Flashcard } from '../interfaceDefinitions'
import { formatEnglishText, formatSpanishText } from '../functions/formatFlashcardText'
import { useStudentFlashcards } from '../hooks/useStudentFlashcards'

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
  const { addFlashcardMutation, removeFlashcardMutation, exampleIsCollected } = useStudentFlashcards()
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

  const questionText = startWithSpanish ? () => formatSpanishText(example.spanglish, spanishText) : () => formatEnglishText(englishText)
  const answerText = startWithSpanish ? () => formatEnglishText(englishText) : () => formatSpanishText(example.spanglish, spanishText)

  return (
    <div className="exampleBox">
      {!answerShowing && (
        <div className="englishTranslation" onClick={toggleAnswer} role="button" aria-label="flashcard">
          {questionText()}
        </div>
      )}
      {answerShowing && (
        <div className="spanishExample" onClick={toggleAnswer} role="button" aria-label="flashcard">
          {answerText()}

          {isStudent && (!exampleIsCollected(example.recordId)
            ? (
                <button
                  type="button"
                  className="addFlashcardButton"
                  onClick={() => addAndAdvance(example)}
                >
                  Add to my flashcards
                </button>
              )
            : (
                <button
                  type="button"
                  className="removeFlashcardButton"
                  onClick={() => removeAndAdvance(example.recordId)}
                >
                  Remove from my flashcards
                </button>
              ))}
        </div>

      )}
      {/* Play/Pause */}
      {(audioActive) && (
        <button
          type="button"
          className="audioPlayPauseButton"
          onClick={togglePlaying}
        >
          <i className={playing ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
        </button>
      )}
    </div>
  )
}
