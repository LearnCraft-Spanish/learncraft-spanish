import type { AudioQuizProps } from '@application/units/useAudioQuiz';
import { useAudioQuiz } from '@application/units/useAudioQuiz';
import { QuizProgress } from '@interface/components/Quizzing/general/QuizProgress';
import React, { useCallback, useEffect } from 'react';
import { Loading } from '../../Loading';
import AudioFlashcard from './AudioFlashcard';
import AudioQuizButtons from './AudioQuizButtons';
import 'src/App.css';
import '../AudioQuiz/AudioBasedReview.css';

/**
 * Audio Quiz UI Component
 * ======================
 *
 * INTERFACE LAYER - User Interface for Audio Quiz Experience
 *
 * This is the top-level UI component that renders the audio quiz interface.
 * It connects the user interface to the application layer orchestration
 * and provides the visual and interactive elements for the quiz.
 *
 * RESPONSIBILITIES:
 * - Render quiz progress and current step
 * - Display audio flashcard with play/pause controls
 * - Handle keyboard shortcuts for quiz navigation
 * - Show loading states during audio initialization
 * - Provide quiz navigation buttons
 * - Display vocabulary help and flashcard management
 *
 * ARCHITECTURAL POSITION:
 * - Layer: Interface (UI Layer)
 * - Uses: useAudioQuiz (application orchestration)
 * - Renders: AudioFlashcard, AudioQuizButtons, QuizProgress
 * - Handles: User interactions and keyboard shortcuts
 *
 * LOADING STATE HANDLING:
 * - Shows "Initializing audio engine..." during FFmpeg setup
 * - Shows "Setting up Quiz..." during quiz preparation
 * - Provides clear feedback for long-running operations
 *
 * KEYBOARD SHORTCUTS:
 * - Arrow Right/D: Next example
 * - Arrow Left/A: Previous example
 * - Arrow Up/W: Next step (question → hint → answer)
 * - Arrow Down/S: Go to question
 * - Space: Play/pause audio
 *
 * USER EXPERIENCE:
 * - Prevents UI flash during quiz load
 * - Smooth transitions between quiz steps
 * - Responsive audio controls
 * - Clear progress indication
 *
 * ERROR HANDLING:
 * - Graceful handling of audio failures
 * - Continues quiz with available examples
 * - Clear error messaging for users
 */
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
    isAudioTranscoderLoading,

    getHelpIsOpen,
    setGetHelpIsOpen,
    vocabComplete,
    vocabulary,

    addPendingRemoveProps,
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
      if (getHelpIsOpen) {
        setGetHelpIsOpen(false);
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
      getHelpIsOpen,
      setGetHelpIsOpen,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // This is a little hacky way to prevent the ui flash on quiz load. may causes side effects.
  if (currentExampleNumber <= 0 || !currentStepValue?.displayText) {
    if (isAudioTranscoderLoading) {
      return (
        <Loading message="Initializing audio engine... This may take a moment on first load." />
      );
    }
    return <Loading message="Setting up Quiz..." />;
  }

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
              // Get Help
              getHelpIsOpen={getHelpIsOpen}
              setGetHelpIsOpen={setGetHelpIsOpen}
              vocabComplete={vocabComplete}
              vocabulary={vocabulary}
              // Add Pending Remove Props
              addPendingRemoveProps={addPendingRemoveProps}
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
            currentExampleNumber={currentExampleNumber}
            totalExamplesNumber={quizLength}
          />
        </>
      )}
    </div>
  );
}
