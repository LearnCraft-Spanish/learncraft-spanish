import type { FlashcardForDisplay } from '@domain/quizzing';
import React from 'react';
import pause from 'src/assets/icons/pause_dark.svg';
import play from 'src/assets/icons/play_dark.svg';
import {
  formatEnglishText,
  formatSpanishText,
} from 'src/functions/formatFlashcardText';
import { AddToMyFlashcardsButtons } from './AddToMyFlashcardsButtons';
import './Quiz.css';

interface FlashcardProps {
  quizExample: FlashcardForDisplay;
  answerShowing: boolean;
  addFlashcard: () => void;
  removeFlashcard: () => void;
  toggleAnswer: () => void;
  togglePlaying: () => void;
  playing: boolean;
}

export function FlashcardDisplay({
  quizExample,
  answerShowing,
  addFlashcard,
  removeFlashcard,
  toggleAnswer,
  togglePlaying,
  playing,
}: FlashcardProps): React.JSX.Element {
  const {
    question,
    answer,
    exampleIsCollected,
    exampleIsCustom,
    exampleIsPending,
  } = quizExample;
  const audioActive =
    (answerShowing && answer.hasAudio) || (!answerShowing && question.hasAudio);

  function handlePlayPause(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    e.stopPropagation();
    togglePlaying();
  }

  const questionText = () =>
    question.spanish
      ? formatSpanishText(question.text)
      : formatEnglishText(question.text);
  const answerText = () =>
    answer.spanish
      ? formatSpanishText(answer.text)
      : formatEnglishText(answer.text);

  return (
    <div className="flashcard" onClick={toggleAnswer} aria-label="flashcard">
      {!answerShowing && (
        <div
          className={`${question.spanish ? 'spanishExample' : 'englishTranslation'}`}
        >
          {questionText()}
        </div>
      )}
      {answerShowing && (
        <div
          className={`${answer.spanish ? 'spanishExample' : 'englishTranslation'}`}
        >
          {answerText()}
          <AddToMyFlashcardsButtons
            exampleIsCollected={exampleIsCollected}
            exampleIsCustom={exampleIsCustom}
            exampleIsPending={exampleIsPending}
            addFlashcard={addFlashcard}
            removeFlashcard={removeFlashcard}
          />
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
