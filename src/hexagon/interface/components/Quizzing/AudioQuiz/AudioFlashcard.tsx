import type { AddPendingRemoveProps } from '@application/units/useTextQuiz';
import type { Vocabulary } from '@learncraft-spanish/shared';
import { AudioQuizStep } from '@domain/audioQuizzing';
import { AddToMyFlashcardsButtons } from '@interface/components/Quizzing/general/AddToMyFlashcardsButtons';
import { GetHelpDisplay } from '@interface/components/Quizzing/general/FlashcardDisplay/GetHelpDisplay';
import React from 'react';
import pauseIcon from 'src/assets/icons/pause.svg';
import playIcon from 'src/assets/icons/play.svg';
interface AudioFlashcardProps {
  vocabComplete: boolean;
  vocabulary: Vocabulary[];
  currentExampleText: string;
  currentStep: AudioQuizStep;
  nextStep: () => void;
  autoplay: boolean;
  progressStatus: number;
  /** True when the buffer should be shown (Question, Hint, Answer only – from hook) */
  isBufferVisible: boolean;
  /** 0–1 progress of the buffer (for countdown bar) */
  bufferProgress: number;
  pause: () => void;
  play: () => void;
  isPlaying: boolean;
  getHelpIsOpen: boolean;
  setGetHelpIsOpen: (getHelpIsOpen: boolean) => void;
  addPendingRemoveProps: AddPendingRemoveProps | undefined;
}

export default function AudioFlashcardComponent({
  vocabComplete,
  vocabulary,
  currentExampleText,
  currentStep,
  nextStep,
  autoplay,
  progressStatus,
  isBufferVisible,
  bufferProgress,
  pause,
  play,
  isPlaying,
  getHelpIsOpen,
  setGetHelpIsOpen,
  addPendingRemoveProps,
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
      style={{
        backgroundColor:
          autoplay &&
          (currentStep === AudioQuizStep.Question ||
            currentStep === AudioQuizStep.Hint)
            ? 'var(--theme)'
            : 'var(--dark)',
      }}
    >
      <p className="audioFlashcardText">{currentExampleText}</p>
      <button
        type="button"
        className="audioPlayPauseButton"
        onClick={(e) => handlePlayPauseClick(e)}
        aria-label="Play/Pause"
      >
        <img src={isPlaying ? pauseIcon : playIcon} alt="play/pause" />
      </button>
      {autoplay &&
        (currentStep === AudioQuizStep.Question ||
          currentStep === AudioQuizStep.Hint) && (
          <div
            className="progressStatus"
            style={{
              width: `${progressStatus * 100}%`,
              transition: `${progressStatus < 0.015 || progressStatus > 0.985 ? 'none' : 'width 0.1s'}`,
              backgroundColor: 'var(--dark)',
            }}
          />
        )}
      {autoplay &&
        (currentStep === AudioQuizStep.Guess ||
          currentStep === AudioQuizStep.Answer) && (
          <div
            className="progressStatus"
            style={{
              width: `${progressStatus * 100}%`,
              transition: `${progressStatus < 0.015 || progressStatus > 0.985 ? 'none' : 'width 0.1s'}`,
              backgroundColor: 'var(--theme)',
            }}
          />
        )}
      {autoplay && isBufferVisible && (
        <div className="audioQuizBuffer" aria-live="polite">
          <svg
            className="audioQuizBufferCircle"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle
              className="audioQuizBufferCircleStroke"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeDasharray={2 * Math.PI * 10}
              strokeDashoffset={
                -2 * Math.PI * 10 * Math.min(bufferProgress / 0.9, 1)
              }
              style={{ transition: 'stroke-dashoffset 0.02s linear' }}
            />
          </svg>
        </div>
      )}
      {addPendingRemoveProps && currentStep === AudioQuizStep.Answer && (
        <div className="AddPendingRemoveButtons">
          <AddToMyFlashcardsButtons
            exampleIsCollected={addPendingRemoveProps.isCollected}
            exampleIsAdding={addPendingRemoveProps.isAdding}
            exampleIsRemoving={addPendingRemoveProps.isRemoving}
            exampleIsCustom={addPendingRemoveProps.isCustom}
            addFlashcard={addPendingRemoveProps.addFlashcard}
            removeFlashcard={addPendingRemoveProps.removeFlashcard}
          />
        </div>
      )}
      {currentStep === AudioQuizStep.Answer && vocabComplete && (
        <div className="getHelpContainer">
          {getHelpIsOpen ? (
            <button
              className="getHelpButton"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setGetHelpIsOpen(false);
              }}
            >
              Hide Help
            </button>
          ) : (
            <button
              className="getHelpButton"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setGetHelpIsOpen(true);
              }}
            >
              Get Help
            </button>
          )}
          {getHelpIsOpen && <GetHelpDisplay vocabulary={vocabulary} />}
        </div>
      )}
    </div>
  );
}
