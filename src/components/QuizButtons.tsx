import React from 'react'

interface QuizButtonsProps {
  decrementExample: () => void
  incrementExample: () => void
  audioActive: string
  togglePlaying: () => void
  playing: boolean
}

export default function QuizButtons({
  decrementExample,
  incrementExample,
  audioActive,
  togglePlaying,
  playing,
}: QuizButtonsProps): JSX.Element {
  return (
    <div className="buttonBox">

      <button type="button" onClick={decrementExample}>
        Previous
      </button>
      {audioActive && (
        <button
          type="button"
          onClick={togglePlaying}
        >
          {playing ? 'Pause Audio' : 'Play Audio'}
        </button>
      )}
      <button type="button" onClick={incrementExample}>
        Next
      </button>

    </div>
  )
}
