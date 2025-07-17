import type { Flashcard } from 'src/types/interfaceDefinitions';
import React from 'react';
import pause from 'src/assets/icons/pause_dark.svg';
import play from 'src/assets/icons/play_dark.svg';
import {
  formatEnglishText,
  formatSpanishText,
} from 'src/functions/formatFlashcardText';
import AddToMyFlashcardsButtons from '../AddToMyFlashcardsButtons';
import './Quiz.css';

interface FlashcardProps {
  example: Flashcard;
  isStudent: boolean;
  answerShowing: boolean;
  startWithSpanish?: boolean;
  incrementExampleNumber: () => void;
  onRemove: () => void;
  toggleAnswer: () => void;
  audioActive: string | undefined;
  togglePlaying: () => void;
  playing: boolean;
}

export default function FlashcardDisplay({
  example,
  isStudent,
  answerShowing,
  incrementExampleNumber,
  audioActive,
  onRemove,
  playing,
  togglePlaying,
  startWithSpanish = false,
  toggleAnswer,
}: FlashcardProps): React.JSX.Element {
  const spanishText = example.spanishExample;
  const englishText = example.englishTranslation;

  function handlePlayPause(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    e.stopPropagation();
    togglePlaying();
  }

  const questionText = startWithSpanish
    ? () => formatSpanishText(example.spanglish, spanishText)
    : () => formatEnglishText(englishText);
  const answerText = startWithSpanish
    ? () => formatEnglishText(englishText)
    : () => formatSpanishText(example.spanglish, spanishText);

  return (
    <div className="flashcard" onClick={toggleAnswer} aria-label="flashcard">
      {!answerShowing && (
        <div className="englishTranslation">{questionText()}</div>
      )}
      {answerShowing && (
        <div className="spanishExample">
          {answerText()}
          {isStudent && (
            <AddToMyFlashcardsButtons
              example={example}
              incrementExampleNumber={incrementExampleNumber}
              onRemove={onRemove}
            />
          )}
        </div>
      )}

      {/* Click to flip */}
      <div
        className={`clickToFlipMessage ${audioActive ? 'flashcardWithAudio' : ''}`}
      >
        <b>Click to flip</b>
      </div>

      {/* Play/Pause */}
      {audioActive && (
        <button
          type="button"
          className="audioPlayPauseButton"
          onClick={(e) => handlePlayPause(e)}
          aria-label="Play/Pause"
        >
          <img src={playing ? pause : play} alt="play/pause" />
        </button>
      )}
    </div>
  );
}
