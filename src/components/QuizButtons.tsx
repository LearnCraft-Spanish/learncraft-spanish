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
  const AudioButtonDisplay = currentAudioUrl === '' ? 'none' : 'inherit'

  return (
    <div className="buttonBox">

      <button type="button" onClick={decrementExample}>
        Previous
      </button>

      <button
        type="button"
        onClick={togglePlaying}
        style={{ display: AudioButtonDisplay }}
      >
        Play/Pause Audio
      </button>

      <button type="button" onClick={incrementExample}>
        Next
      </button>

    </div>
  )
}
