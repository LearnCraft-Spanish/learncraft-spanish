import type { AudioQuizProps } from '@application/units/useAudioQuiz';
import { useAudioQuiz } from '@application/units/useAudioQuiz';
import { QuizProgress } from '@interface/components/Quizzing/general/QuizProgress';
import React, { useCallback, useEffect } from 'react';
import AudioFlashcard from './AudioFlashcard';
import AudioQuizButtons from './AudioQuizButtons';
import 'src/App.css';
import '../AudioQuiz/AudioBasedReview.css';

export default function AudioQuiz({
  audioQuizProps,
}: {
  audioQuizProps: AudioQuizProps;
}) {
  // Destructure the hook return
  const {
    goToQuestion,
    goToHint,
    nextExample,
    previousExample,
    nextStep,
    pause,
    play,
    isPlaying,
    quizLength,
    progressStatus,
    currentStepValue,
    currentExampleNumber,
    currentStep,
    autoplay,
    audioQuizType,
    cleanupFunction,
  } = useAudioQuiz(audioQuizProps);

  /*    Keyboard Controls       */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'd') {
        nextExample();
      } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        previousExample();
      } else if (event.key === 'ArrowUp' || event.key === 'w') {
        event.preventDefault();
        nextStep();
      } else if (event.key === 'ArrowDown' || event.key === 's') {
        event.preventDefault();
        goToQuestion();
      } else if (event.key === ' ') {
        event.preventDefault();
        if (isPlaying) {
          pause();
        } else {
          play();
        }
      }
    },
    [
      nextExample,
      previousExample,
      goToQuestion,
      nextStep,
      pause,
      isPlaying,
      play,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="quiz">
      {currentExampleNumber > 0 && (
        <>
          <div className="audioBox">
            <QuizProgress
              currentExampleNumber={currentExampleNumber}
              totalExamplesNumber={quizLength}
            />
            <AudioFlashcard
              currentExampleText={currentStepValue?.displayText ?? ''}
              currentStep={currentStep}
              nextStep={nextStep}
              autoplay={autoplay}
              progressStatus={progressStatus}
              pause={pause}
              play={play}
              isPlaying={isPlaying}
            />
          </div>
          <AudioQuizButtons
            nextStep={nextStep}
            autoplay={autoplay}
            previousExample={previousExample}
            nextExample={nextExample}
            audioQuizType={audioQuizType}
            goToHint={goToHint}
            goToQuestion={goToQuestion}
            currentStep={currentStep}
            closeQuiz={cleanupFunction}
          />
        </>
      )}
    </div>
  );
}
