import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { Flashcard } from '../interfaceDefinitions'

interface FlashcardProps {
  example: Flashcard
  isStudent: boolean
  startWithSpanish: boolean
  addFlashcardAndUpdate: (recordId: number) => void
  removeFlashcardAndUpdate: (recordId: number) => void
}

export default function FlashcardDisplay({ example, isStudent, startWithSpanish = false, addFlashcardAndUpdate, removeFlashcardAndUpdate }: FlashcardProps): JSX.Element {
  const currentAudio = useRef<HTMLAudioElement>(null)
  const [answerShowing, setAnswerShowing] = useState<boolean>(false)

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

  function spanishAudio() {
    const audioUrl = example.spanishAudioLa
    const audioElement
      = (
        <audio
          ref={currentAudio}
          src={audioUrl}
        />
      )
    return audioElement
  }

  function englishAudio() {
    const audioUrl = example.spanishAudioLa
    const audioElement
      = (
        <audio
          ref={currentAudio}
          src={audioUrl}
        />
      )
    return audioElement
  }

  const questionText = startWithSpanish ? formatSpanishText : formatEnglishText
  const answerText = startWithSpanish ? formatEnglishText : formatSpanishText
  const questionAudio = startWithSpanish ? spanishAudio : englishAudio
  const answerAudio = startWithSpanish ? englishAudio : spanishAudio

  const toggleAnswer = useCallback(() => {
    setAnswerShowing(!answerShowing)
  }, [answerShowing])

  const hideAnswer = useCallback(() => {
    setAnswerShowing(false)
  }, [])

  useEffect(() => {
    hideAnswer()
  }, [example, hideAnswer])

  return (
    <div className="exampleBox">
      {!answerShowing && (
        <div className="englishTranslation" onClick={toggleAnswer}>
          {questionText()}
          {questionAudio()}
        </div>
      )}
      {answerShowing && (
        <div className="spanishExample" onClick={toggleAnswer}>
          {answerText()}
          {answerAudio()}

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
