import React from 'react'
import type { Flashcard } from '../interfaceDefinitions'
import { formatEnglishText, formatSpanishText } from '../functions/formatFlashcardText'
import './Quiz.css'

interface FlashcardProps {
  example: Flashcard
  isStudent: boolean
  answerShowing: boolean
  startWithSpanish?: boolean
  addFlashcardAndUpdate: (recordId: number) => void
  removeFlashcardAndUpdate: (recordId: number) => void
  toggleAnswer: () => void
  audioActive: string
  togglePlaying: () => void
  playing: boolean
}

export default function FlashcardDisplay({
  example,
  isStudent,
  answerShowing,
  startWithSpanish = false,
  addFlashcardAndUpdate,
  removeFlashcardAndUpdate,
  toggleAnswer,
  audioActive,
  togglePlaying,
  playing,
}: FlashcardProps): JSX.Element {
  const spanishText = example.spanishExample
  const englishText = example.englishTranslation

  const questionText = startWithSpanish ? () => formatSpanishText(example.spanglish, spanishText) : () => formatEnglishText(englishText)
  const answerText = startWithSpanish ? () => formatEnglishText(englishText) : () => formatSpanishText(example.spanglish, spanishText)

  function handlePlayPause(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    e.stopPropagation()
    togglePlaying()
  }
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

          {isStudent && (!example.isCollected
            ? (
                <button
                  type="button"
                  className="addFlashcardButton"
                  onClick={() =>
                    addFlashcardAndUpdate(
                      example.recordId,
                    )}
                >
                  Add to my flashcards
                </button>
              )
            : (
                <button
                  type="button"
                  className="removeFlashcardButton"
                  onClick={() => removeFlashcardAndUpdate(example.recordId)}
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
          onClick={e => handlePlayPause(e)}
        >
          <i className={playing ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
        </button>
      )}
    </div>
  )
}
