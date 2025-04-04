import React from 'react';

type stepValues = 'question' | 'guess' | 'hint' | 'answer';
interface AudioQuizButtonsProps {
  audioOrComprehension: 'audio' | 'comprehension';
  currentStep: stepValues;
  incrementCurrentStep: () => void;
  autoplay: boolean;
  customIncrementCurrentStep: (step: stepValues) => void;
  decrementExample: () => void;
  incrementExample: () => void;
  unReadyQuiz: () => void;
}
export default function AudioQuizButtons({
  audioOrComprehension,
  currentStep,
  incrementCurrentStep,
  autoplay,
  customIncrementCurrentStep,
  decrementExample,
  incrementExample,
  unReadyQuiz,
}: AudioQuizButtonsProps): React.JSX.Element {
  function nextStepButtonText(): string {
    switch (audioOrComprehension) {
      case 'audio':
        switch (currentStep) {
          case 'question':
            if (autoplay) {
              return 'Skip to Guess';
            } else {
              return 'Play Spanish';
            }
          case 'guess':
            return 'Play Spanish';
          case 'hint':
            return 'Play Again';
          case 'answer':
            return 'Next';
        }
        break;
      case 'comprehension':
        switch (currentStep) {
          case 'question':
            if (autoplay) {
              return 'Skip to Guess';
            } else {
              return 'Show Spanish';
            }
          case 'guess':
            return 'Show Spanish';
          case 'hint':
            return 'Show English';
          case 'answer':
            return 'Next';
        }
        break;
    }
  }
  function previousStepButton(): React.JSX.Element {
    if (audioOrComprehension === 'audio') {
      // I think in the original code there was supposted to be a case Play again, but I could not reproduce it.
      return (
        <button
          type="button"
          onClick={() => customIncrementCurrentStep('question')}
        >
          Replay English
        </button>
      );
    } else {
      switch (currentStep) {
        case 'question':
          return (
            <button
              type="button"
              onClick={() => customIncrementCurrentStep('question')}
            >
              Replay Spanish
            </button>
          );
        case 'guess':
          return (
            <button
              type="button"
              onClick={() => customIncrementCurrentStep('question')}
            >
              Replay Spanish
            </button>
          );
        case 'hint':
          return (
            <button
              type="button"
              onClick={() => customIncrementCurrentStep('hint')}
            >
              Replay Spanish
            </button>
          );
        case 'answer':
          return (
            <button
              type="button"
              onClick={() => customIncrementCurrentStep('hint')}
            >
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
          onClick={() => incrementCurrentStep()}
        >
          {nextStepButtonText()}
        </button>
      </div>
      <div className="buttonBox">
        <button type="button" onClick={() => decrementExample()}>
          Previous
        </button>
        <button type="button" onClick={() => incrementExample()}>
          Next
        </button>
      </div>
      <div className="buttonBox">
        <button type="button" onClick={() => unReadyQuiz()}>
          Back
        </button>
      </div>
    </div>
  );
}
