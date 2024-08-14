import React from 'react'

interface QuizButtonsProps {
  decrementExample: () => void
  incrementExample: () => void
  currentAudioUrl: string
  togglePlaying: () => void
}

export default function QuizButtons({
  decrementExample,
  incrementExample,
  currentAudioUrl,
  togglePlaying,
}: QuizButtonsProps): JSX.Element {
  console.log(`currentAudioUrl: ${currentAudioUrl?.length}`)
  return (
    <div className="buttonBox">

      <button type="button" onClick={decrementExample}>
        Previous
      </button>
      {currentAudioUrl && (
        <button
          type="button"
          onClick={togglePlaying}
        >
          Play/Pause Audio
        </button>
      )}
      <button type="button" onClick={incrementExample}>
        Next
      </button>

    </div>
  )
}
