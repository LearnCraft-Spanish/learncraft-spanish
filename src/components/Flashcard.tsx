import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { Flashcard } from '../interfaceDefinitions'

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

  function formatSpanishText() {
    if (example.spanglish !== 'spanglish') {
      return <p className="spanishFlashcardText">{spanishText}</p>
    }
    else {
      const textParts = spanishText.split('*')

      return (
        <p>
          {textParts.map((part, index) => {
            // Create a more stable key by combining the index with part of the content
            const key = `${index}-${part}`

            return index % 2 === 1
              ? (
                  <span key={key} className="englishFlashcardText">
                    {part}
                  </span>
                )
              : (
                  <span key={key} className="spanishFlashcardText">
                    {part}
                  </span>
                )
          })}
        </p>
      )
    }
  }

  function formatEnglishText() {
    return <p className="englishFlashcardText">{englishText}</p>
  }

  const questionText = startWithSpanish ? formatSpanishText : formatEnglishText
  const answerText = startWithSpanish ? formatEnglishText : formatSpanishText

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

          {isStudent && (!example.isKnown
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
