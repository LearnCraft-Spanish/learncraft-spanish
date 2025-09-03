import React from 'react';
import pause from 'src/assets/icons/pause.svg';
import play from 'src/assets/icons/play.svg';
interface AudioFlashcardProps {
  currentExampleText: string;
  nextStep: () => void;
  autoplay: boolean;
  progressStatus: number;
  pausePlayback: () => void;
  resumePlayback: () => void;
  isPlaying: boolean;
}

export default function AudioFlashcardComponent({
  currentExampleText,
  nextStep,
  autoplay,
  progressStatus,
  pausePlayback,
  resumePlayback,
  isPlaying,
}: AudioFlashcardProps): React.JSX.Element {
  function handlePlayPauseClick(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    e.stopPropagation();
    if (isPlaying) {
      pausePlayback();
    } else {
      resumePlayback();
    }
  }

  return (
    <div
      className="audioFlashcard"
      // Clicking flashcard for next step only works if autoplay is off
      onClick={!autoplay ? () => nextStep() : () => {}}
    >
      <p>{currentExampleText}</p>
      {autoplay && (
        <button
          type="button"
          className="audioPlayPauseButton"
          onClick={(e) => handlePlayPauseClick(e)}
          aria-label="Play/Pause"
        >
          <img src={isPlaying ? pause : play} alt="play/pause" />
        </button>
      )}
      {autoplay && (
        <div
          className="progressStatus"
          style={{ width: `${progressStatus * 100}%` }}
        />
      )}
    </div>
  );
}
