import React from 'react'
import type { Flashcard } from '../interfaceDefinitions'
import { formatEnglishText, formatSpanishText } from '../functions/formatFlashcardText'
import { useStudentFlashcards } from '../hooks/useStudentFlashcards'

interface FlashcardProps {
  example: Flashcard
  isStudent: boolean
  answerShowing: boolean
  startWithSpanish?: boolean
  toggleAnswer: () => void
}

export default function FlashcardDisplay({ example, isStudent, answerShowing, startWithSpanish = false, toggleAnswer }: FlashcardProps): JSX.Element {
  const { addFlashcardMutation, removeFlashcardMutation } = useStudentFlashcards()
  const addFlashcard = addFlashcardMutation.mutate
  const removeFlashcard = removeFlashcardMutation.mutate
  const spanishText = example.spanishExample
  const englishText = example.englishTranslation

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

          {isStudent && (!example.isCollected
            ? (
                <button
                  type="button"
                  className="addFlashcardButton"
                  onClick={() => addFlashcard(example)}
                >
                  Add to my flashcards
                </button>
              )
            : (
                <button
                  type="button"
                  className="removeFlashcardButton"
                  onClick={() => removeFlashcard(example.recordId)}
                >
                  Remove from my flashcards
                </button>
              ))}
        </div>
      )}
    </div>
  )
}
