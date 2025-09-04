import React from 'react';
import pauseIcon from 'src/assets/icons/pause.svg';
import playIcon from 'src/assets/icons/play.svg';
interface AudioFlashcardProps {
  currentExampleText: string;
  nextStep: () => void;
  autoplay: boolean;
  progressStatus: number;
  pause: () => void;
  play: () => void;
  isPlaying: boolean;
}

export default function AudioFlashcardComponent({
  currentExampleText,
  nextStep,
  autoplay,
  progressStatus,
  pause,
  play,
  isPlaying,
}: AudioFlashcardProps): React.JSX.Element {
  function handlePlayPauseClick(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    e.stopPropagation();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }

  return (
    <div
      className="audioFlashcard"
      // Clicking flashcard for next step only works if autoplay is off
      onClick={!autoplay ? () => nextStep() : () => {}}
    >
      <p>{currentExampleText}</p>
      <button
        type="button"
        className="audioPlayPauseButton"
        onClick={(e) => handlePlayPauseClick(e)}
        aria-label="Play/Pause"
      >
        <img src={isPlaying ? pauseIcon : playIcon} alt="play/pause" />
      </button>
      {autoplay && (
        <div
          className="progressStatus"
          style={{
            width: `${progressStatus * 100}%`,
            transition: `${progressStatus ? 'width 0.2s' : 'none'}`,
          }}
        />
      )}
    </div>
  );
}
