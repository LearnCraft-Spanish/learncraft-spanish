import type { AudioQuizReturn } from '@application/units/AudioQuiz/useAudioQuiz';
import type { JSX } from 'react';
import { useVocabInfo } from '@application/units/useVocabInfo';
import { AudioQuizType } from '@domain/audioQuizzing';
import { AudioQuizEndV2 } from '@interface/components/audioQuiz/AudioQuizEndV2';
import { AudioQuizV2 } from '@interface/components/audioQuiz/AudioQuizV2';
import { Loading } from '@interface/components/Loading';
import { useCallback } from 'react';

export interface AudioQuizV2ScreenProps {
  audioQuizReturn: AudioQuizReturn;
}

/**
 * Drop-in v2 replacement for `AudioQuiz`, gated behind
 * `ui.student.audioquiz.v2` in `RegularAudioQuiz` and
 * `ReviewMyFlashcardsAudioQuiz`. Same loading / complete states as the
 * legacy screen — only the active-card view (`AudioQuizV2`) and the
 * complete screen (`AudioQuizEndV2`) are redesigned.
 *
 * `vocabInfoHook` is sourced the same way `useTextQuiz` sources it for
 * `TextQuizV2Screen` (`const vocabInfoHook = useVocabInfo;`) — `useAudioQuiz`
 * does not expose one, and this passes the hook itself through as a value
 * (never called here), so it does not count against the "one hook per
 * component" rule.
 */
export function AudioQuizV2Screen({
  audioQuizReturn,
}: AudioQuizV2ScreenProps): JSX.Element {
  const {
    autoplay,
    audioQuizType,
    currentStep,
    currentStepValue,
    currentExampleNumber,
    progressStatus,
    isPlaying,
    pause,
    play,
    nextStep,
    restartCurrentStep,
    nextExample,
    previousExample,
    quizLength,
    cleanupFunction,
    isQuizComplete,
    restartQuiz,
    getHelpIsOpen,
    setGetHelpIsOpen,
    vocabComplete,
    vocabulary,
    addPendingRemoveProps,
  } = audioQuizReturn;

  const handlePlay = useCallback((): void => {
    play().catch(() => {
      // Autoplay restrictions are not actionable here — `isPlaying` simply
      // stays false and the play button remains available to retry.
    });
  }, [play]);

  const handlePause = useCallback((): void => {
    pause().catch(() => {});
  }, [pause]);

  if (isQuizComplete) {
    return (
      <AudioQuizEndV2
        speakingOrListening={
          audioQuizType === AudioQuizType.Speaking ? 'speaking' : 'listening'
        }
        isAutoplay={autoplay}
        quizLength={quizLength}
        restartQuiz={restartQuiz}
        returnToQuizSetup={cleanupFunction}
      />
    );
  }

  // Mirrors the legacy `AudioQuiz`'s own guard, preventing a flash of an
  // incomplete card while the first step's audio is still parsing.
  if (currentExampleNumber <= 0 || !currentStepValue?.displayText) {
    return <Loading message="Setting up Quiz..." />;
  }

  return (
    <AudioQuizV2
      audioQuizType={audioQuizType}
      autoplay={autoplay}
      exampleNumber={currentExampleNumber}
      quizLength={quizLength}
      currentStep={currentStep}
      displayText={currentStepValue.displayText}
      isSpanishText={currentStepValue.spanish}
      progressStatus={progressStatus * 100}
      isPlaying={isPlaying}
      play={handlePlay}
      pause={handlePause}
      onPrimary={nextStep}
      onReplay={restartCurrentStep}
      onPrevious={previousExample}
      onNext={nextExample}
      onExit={cleanupFunction}
      getHelpIsOpen={getHelpIsOpen}
      setGetHelpIsOpen={setGetHelpIsOpen}
      vocabulary={vocabulary}
      vocabComplete={vocabComplete}
      vocabInfoHook={useVocabInfo}
      addPendingRemoveProps={addPendingRemoveProps}
    />
  );
}
