import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import { audioQuizReplayLabel } from '@domain/functions/audioQuizCopy';
import React from 'react';

interface AudioQuizButtonsProps {
  audioQuizType: AudioQuizType;
  autoplay: boolean;
  closeQuiz: () => void;
  currentStep: AudioQuizStep;
  isFirstExample: boolean;
  isLastExample: boolean;
  nextExample: () => void;
  nextExampleReady: boolean;
  nextStep: () => void;
  previousExample: () => void;
  previousExampleReady: boolean;
  replay: () => void;
}

export default function AudioQuizButtons({
  audioQuizType,
  autoplay,
  closeQuiz,
  currentStep,
  isFirstExample,
  isLastExample,
  nextExample,
  nextExampleReady,
  nextStep,
  previousExample,
  previousExampleReady,
  replay,
}: AudioQuizButtonsProps): React.JSX.Element {
  function nextStepButtonText(): string {
    switch (audioQuizType) {
      case AudioQuizType.Speaking:
        switch (currentStep) {
          case AudioQuizStep.Question:
            if (autoplay) {
              return 'Skip to Guess';
            } else {
              return 'Play Spanish';
            }
          case AudioQuizStep.Guess:
            return 'Play Spanish';
          case AudioQuizStep.Hint:
            return 'Play Again';
          case AudioQuizStep.Answer:
            if (isLastExample) {
              return 'Finish';
            } else {
              return 'Next';
            }
        }
        break;
      case AudioQuizType.Listening:
        switch (currentStep) {
          case AudioQuizStep.Question:
            if (autoplay) {
              return 'Skip to Guess';
            } else {
              return 'Show Spanish';
            }
          case AudioQuizStep.Guess:
            return 'Show Spanish';
          case AudioQuizStep.Hint:
            return 'Show English';
          case AudioQuizStep.Answer:
            if (isLastExample) {
              return 'Finish';
            } else {
              return 'Next';
            }
        }
    }
  }

  return (
    <div className="audioQuizButtons">
      <div className="buttonBox switchOnMobile">
        <button type="button" onClick={() => replay()}>
          {audioQuizReplayLabel({
            quizType: audioQuizType,
            step: currentStep,
          })}
        </button>
        <button
          type="button"
          className="greenButton"
          onClick={() => nextStep()}
        >
          {nextStepButtonText()}
        </button>
      </div>
      <div className="buttonBox">
        <button
          type="button"
          onClick={() => previousExample()}
          disabled={isFirstExample || !previousExampleReady}
        >
          Previous
        </button>

        <button
          type="button"
          onClick={() => nextExample()}
          disabled={!nextExampleReady && !isLastExample}
        >
          {isLastExample ? 'Finish' : 'Next'}
        </button>
      </div>
      <div className="buttonBox">
        <button type="button" onClick={() => closeQuiz()}>
          Back
        </button>
      </div>
    </div>
  );
}
