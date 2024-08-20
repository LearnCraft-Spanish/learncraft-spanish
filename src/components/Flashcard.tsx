import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { Flashcard } from '../interfaceDefinitions'
import { formatEnglishText, formatSpanishText } from '../functions/formatFlashcardText'

interface FlashcardProps {
  example: Flashcard
  isStudent: boolean
  answerShowing: boolean
  startWithSpanish?: boolean
  addFlashcardAndUpdate: (recordId: number) => void
  removeFlashcardAndUpdate: (recordId: number) => void
  toggleAnswer: () => void
}

export default function FlashcardDisplay({ example, isStudent, answerShowing, startWithSpanish = false, addFlashcardAndUpdate, removeFlashcardAndUpdate, toggleAnswer }: FlashcardProps): JSX.Element {
  const spanishText = example.spanishExample
  const englishText = example.englishTranslation

  const questionText = startWithSpanish ? () => formatSpanishText(example.spanglish, spanishText) : () => formatEnglishText(englishText)
  const answerText = startWithSpanish ? () => formatEnglishText(englishText) : () => formatSpanishText(example.spanglish, spanishText)

  return (
    <div className="exampleBox">
      {!answerShowing && (
        <div className="englishTranslation" onClick={toggleAnswer}>
          {questionText()}
        </div>
      )}
      {answerShowing && (
        <div className="spanishExample" onClick={toggleAnswer}>
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
    </div>
  )
}
