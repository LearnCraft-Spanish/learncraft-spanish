import type { AudioQuizReturn } from '@application/units/useAudioQuiz';
import { AudioQuizType } from '@domain/audioQuizzing';
import { Loading } from '@interface/components/Loading';
import AudioFlashcard from '@interface/components/Quizzing/AudioQuiz/AudioFlashcard';
import AudioQuizButtons from '@interface/components/Quizzing/AudioQuiz/AudioQuizButtons';
import AudioQuizEnd from '@interface/components/Quizzing/general/AudioQuizEnd';
import { QuizProgress } from '@interface/components/Quizzing/general/QuizProgress';
import React, { useCallback, useEffect } from 'react';

// TO DO: Remove duplicate styles.
import 'src/App.css';

import './AudioBasedReview.css';

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

/**
 * AudioQuiz component
 * Note: This is the base level AudioQuiz. It should not be used directly. Instead, use the RegularAudioQuiz, ReviewMyFlashcardsAudioQuiz, or SrsAudioQuiz components.
 * @param props - props
 * @param props.audioQuizReturn - The return object from the useAudioQuiz hook
 */
export default function AudioQuiz({
  audioQuizReturn,
}: {
  audioQuizReturn: AudioQuizReturn;
}) {
  // Destructure the hook return
  const {
    goToQuestion,
    goToHint,
    restartCurrentStep,
    nextExample,
    previousExample,
    nextExampleReady,
    previousExampleReady,
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
    isQuizComplete,
    restartQuiz,

    getHelpIsOpen,
    setGetHelpIsOpen,
    vocabComplete,
    vocabulary,

    addPendingRemoveProps,
  } = audioQuizReturn;

  /*    Keyboard Controls       */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (isQuizComplete) return; // prevent keyboard controls when quiz is complete

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
      isQuizComplete,
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

  // Prevent UI flash on quiz load by showing loading until currentStepValue is ready
  // With debounced navigation, this should rarely be seen during normal usage
  if (currentExampleNumber <= 0 || !currentStepValue?.displayText) {
    return <Loading message="Setting up Quiz..." />;
  }

  // Show quiz end screen when complete
  if (isQuizComplete) {
    return (
      <AudioQuizEnd
        speakingOrListening={
          audioQuizType === AudioQuizType.Speaking ? 'speaking' : 'listening'
        }
        isAutoplay={autoplay}
        restartQuiz={restartQuiz}
        returnToQuizSetup={cleanupFunction}
      />
    );
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
            audioQuizType={audioQuizType}
            autoplay={autoplay}
            closeQuiz={cleanupFunction}
            currentStep={currentStep}
            goToHint={goToHint}
            goToQuestion={goToQuestion}
            isFirstExample={currentExampleNumber === 1}
            isLastExample={currentExampleNumber === quizLength}
            nextExample={nextExample}
            nextExampleReady={nextExampleReady}
            nextStep={nextStep}
            previousExample={previousExample}
            previousExampleReady={previousExampleReady}
            restartCurrentStep={restartCurrentStep}
          />
        </>
      )}
    </div>
  );
}
