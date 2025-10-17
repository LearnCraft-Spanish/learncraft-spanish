import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import React from 'react';

interface AudioQuizButtonsProps {
  audioQuizType: AudioQuizType;
  autoplay: boolean;
  closeQuiz: () => void;
  currentStep: AudioQuizStep;
  goToHint: () => void;
  goToQuestion: () => void;
  isFirstExample: boolean;
  isLastExample: boolean;
  nextExample: () => void;
  nextExampleReady: boolean;
  nextStep: () => void;
  previousExample: () => void;
  previousExampleReady: boolean;
  restartCurrentStep: () => void;
}

export default function AudioQuizButtons({
  audioQuizType,
  autoplay,
  closeQuiz,
  currentStep,
  goToHint,
  goToQuestion,
  isFirstExample,
  isLastExample,
  nextExample,
  nextExampleReady,
  nextStep,
  previousExample,
  previousExampleReady,
  restartCurrentStep,
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

  function previousStepButton(): React.JSX.Element {
    if (audioQuizType === AudioQuizType.Speaking) {
      if (currentStep === AudioQuizStep.Question) {
        return (
          <button type="button" onClick={() => restartCurrentStep()}>
            Replay English
          </button>
        );
      } else {
        return (
          <button type="button" onClick={() => goToQuestion()}>
            Replay English
          </button>
        );
      }
    } else {
      switch (currentStep) {
        case AudioQuizStep.Question:
          return (
            <button type="button" onClick={() => restartCurrentStep()}>
              Replay Spanish
            </button>
          );
        case AudioQuizStep.Guess:
          return (
            <button type="button" onClick={() => goToQuestion()}>
              Replay Spanish
            </button>
          );
        case AudioQuizStep.Hint:
          return (
            <button type="button" onClick={() => restartCurrentStep()}>
              Replay Spanish
            </button>
          );
        case AudioQuizStep.Answer:
          return (
            <button type="button" onClick={() => goToHint()}>
              Replay Spanish
            </button>
          );
      }
    }
  }

  return (
    <div className="audioQuizButtons">
      <div className="buttonBox switchOnMobile">
        {previousStepButton()}
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
