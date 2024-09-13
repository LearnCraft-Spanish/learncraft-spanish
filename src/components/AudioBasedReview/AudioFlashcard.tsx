interface AudioFlashcardProps {
  currentExampleText: string | JSX.Element
  incrementCurrentStep: () => void
  autoplay: boolean
  progressStatus: number
  pausePlayback: () => void
  resumePlayback: () => void
  isPlaying: boolean
}

export default function AudioFlashcardComponent({
  currentExampleText,
  incrementCurrentStep,
  autoplay,
  progressStatus,
  pausePlayback,
  resumePlayback,
  isPlaying,
}: AudioFlashcardProps): JSX.Element {
  function handlePlayPauseClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    e.stopPropagation()
    if (isPlaying) {
      pausePlayback()
    }
    else {
      resumePlayback()
    }
  }
  return (
    <div
      className="audioFlashcard"
      onClick={!autoplay ? () => incrementCurrentStep() : () => {}}
    >
      <p>{currentExampleText}</p>
      {(autoplay) && (
        <button
          type="button"
          className="audioPlayPauseButton"
          onClick={e => handlePlayPauseClick(e)}
        >
          <i className={isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
        </button>
      )}
      {autoplay && (
        <div
          className="progressStatus"
          style={{ width: `${progressStatus * 100}%` }}
        />
      )}
    </div>
  )
}
