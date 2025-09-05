import type {
  AudioQuizAnswer,
  AudioQuizGuess,
  AudioQuizHint,
  AudioQuizQuestion,
  ListeningQuizExample,
  SpeakingQuizExample,
} from '@domain/audioQuizzing';
import type { Example } from '@learncraft-spanish/shared';
import { useAudioAdapter } from '@application/adapters/audioAdapter';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAudioQuizExample } from '../utils/audioQuizzingMappers';

interface AudioQuizProps {
  examplesToQuiz: Example[];
  audioQuizType: AudioQuizType;
  autoplay: boolean;
  ready: boolean; // Flag to prevent audio from playing in the background
}

export interface AudioQuizReturn {
  currentExampleNumber: number;
  currentExampleReady: boolean;
  currentExample: Example | null;
  currentStep: AudioQuizStep;
  currentStepValue:
    | AudioQuizQuestion
    | AudioQuizGuess
    | AudioQuizHint
    | AudioQuizAnswer
    | null;
  nextExampleReady: boolean;
  previousExampleReady: boolean;
  progressStatus: number;
  isPlaying: boolean;
  pause: () => void;
  play: () => void;
  nextStep: () => void;
  goToQuestion: () => void;
  goToHint: () => void;
  goToAnswer: () => void;
  nextExample: () => void;
  previousExample: () => void;
  quizLength: number;
  resetQuiz: () => void;
}

export function useAudioQuiz({
  examplesToQuiz,
  audioQuizType,
  autoplay,
  ready, // Flag to prevent audio from playing in the background
}: AudioQuizProps): AudioQuizReturn {
  const {
    play,
    pause,
    isPlaying,
    currentTime,
    changeCurrentAudio,
    preloadAudio,
  } = useAudioAdapter();

  // Examples that have bad audio and should be skipped
  const [badAudioExamples, setBadAudioExamples] = useState<number[]>([]);
  const parseInProgress = useRef(false);

  // Marks an example as bad, removing it from the review list
  const markExampleAsBad = useCallback((exampleId: number) => {
    console.error('unplayable example found with id', exampleId);
    setBadAudioExamples((prev) => [...prev, exampleId]);
  }, []);

  // The examples to reviw, but with invalid audio filtered out
  const safeExamples = useMemo(() => {
    return examplesToQuiz.filter((example) => {
      if (badAudioExamples.includes(example.id)) {
        return false;
      }
      return true;
    });
  }, [examplesToQuiz, badAudioExamples]);

  // The selected example index within the safe examples
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number>(0);

  // The closest example index to the selected example index within the safe examples
  // This prevents an out of bounds render when an example is marked as bad
  const currentExampleIndex = useMemo(() => {
    if (selectedExampleIndex < 0) {
      return 0;
    }
    if (selectedExampleIndex > safeExamples.length - 1) {
      return safeExamples.length - 1;
    }
    return selectedExampleIndex;
  }, [selectedExampleIndex, safeExamples]);

  // The current review step for the current example
  const [currentStep, setCurrentStep] = useState<AudioQuizStep>(
    AudioQuizStep.Question,
  );

  const goToQuestion = useCallback(() => {
    setCurrentStep(AudioQuizStep.Question);
  }, []);

  const goToHint = useCallback(() => {
    setCurrentStep(AudioQuizStep.Hint);
  }, []);

  const goToAnswer = useCallback(() => {
    setCurrentStep(AudioQuizStep.Answer);
  }, []);

  // Simple utility functions to increment and decrement the example index
  const nextExample = useCallback(() => {
    if (currentExampleIndex + 1 < safeExamples.length - 1) {
      setSelectedExampleIndex(currentExampleIndex + 1);
      goToQuestion();
    } else {
      setSelectedExampleIndex(safeExamples.length - 1);
      goToQuestion();
    }
  }, [
    currentExampleIndex,
    setSelectedExampleIndex,
    safeExamples,
    goToQuestion,
  ]);

  const previousExample = useCallback(() => {
    if (currentExampleIndex > 0) {
      setSelectedExampleIndex(currentExampleIndex - 1);
      goToQuestion();
    } else {
      setSelectedExampleIndex(0);
      goToQuestion();
    }
  }, [currentExampleIndex, setSelectedExampleIndex, goToQuestion]);

  // Ref to track changes to the current example index
  const previousExampleIndexRef = useRef<number>(-1);

  // Ref to track changes to the current step
  const previousStepRef = useRef<AudioQuizStep | null>(null);

  // Ref used for autoplay to mark when the audio has entered the padding
  const isInPadding = useRef(false);

  // The current example number (1-indexed for UI purposes)
  // Used only in export for UI, should not be referenced for stateful logic
  const currentExampleNumber = currentExampleIndex + 1; // 1-indexed

  // Audio examples are parsed on the fly
  // This is a map of example id to the parsed example
  // We use it to avoid parsing the same example multiple times
  const [parsedListeningExamples, setParsedListeningExamples] = useState<
    Record<number, ListeningQuizExample>
  >({});

  const [parsedSpeakingExamples, setParsedSpeakingExamples] = useState<
    Record<number, SpeakingQuizExample>
  >({});

  const resetQuiz = useCallback(() => {
    setSelectedExampleIndex(0);
    setCurrentStep(AudioQuizStep.Question);
    previousStepRef.current = null;
    isInPadding.current = false;
    previousExampleIndexRef.current = -1;
    changeCurrentAudio({
      currentTime: 0,
      src: '',
      onEnded: () => {},
      playOnLoad: true,
    });
  }, [changeCurrentAudio]);

  // Steps the quiz forward
  const nextStep = useCallback(() => {
    switch (currentStep) {
      case AudioQuizStep.Question:
        if (autoplay) {
          setCurrentStep(AudioQuizStep.Guess);
        } else {
          setCurrentStep(AudioQuizStep.Hint);
        }
        break;
      case AudioQuizStep.Guess:
        setCurrentStep(AudioQuizStep.Hint);

        break;
      case AudioQuizStep.Hint:
        setCurrentStep(AudioQuizStep.Answer);
        break;
      case AudioQuizStep.Answer:
        if (currentExampleIndex === safeExamples.length - 1 && autoplay) {
          resetQuiz();
          return;
        }
        nextExample();
        // Proceed to next question
        break;
      default:
        console.error('Invalid currentStep value: ', currentStep);
    }
  }, [
    resetQuiz,
    autoplay,
    currentStep,
    nextExample,
    currentExampleIndex,
    safeExamples.length,
  ]);

  // Simple memos for the current, next, and previous examples
  // Undefined if unavailable, implies either loading state or out of array bounds
  const currentExampleMemo = useMemo((): Example | undefined => {
    if (safeExamples.length > 0) {
      return safeExamples[currentExampleIndex];
    }
  }, [safeExamples, currentExampleIndex]);

  const nextExampleMemo = useMemo((): Example | undefined => {
    if (
      safeExamples.length > 0 &&
      currentExampleIndex + 1 < safeExamples.length
    ) {
      return safeExamples[currentExampleIndex + 1];
    }
  }, [safeExamples, currentExampleIndex]);

  const previousExampleMemo = useMemo((): Example | undefined => {
    if (safeExamples.length > 0 && currentExampleIndex > 0) {
      return safeExamples[currentExampleIndex - 1];
    }
  }, [safeExamples, currentExampleIndex]);

  const parseAudioExample = useCallback(
    async (safeIndex: number) => {
      // Prevent race conditions by checking if a parse is already in progress
      if (parseInProgress.current) {
        return;
      }

      // Get the example to parse
      const example = safeExamples[safeIndex];

      // If the next example is out of bounds, not ready, or already parsed, return
      if (
        safeIndex >= safeExamples.length ||
        !example ||
        (audioQuizType === AudioQuizType.Speaking &&
          parsedSpeakingExamples[example.id]) ||
        (audioQuizType === AudioQuizType.Listening &&
          parsedListeningExamples[example.id])
      ) {
        return;
      }

      // Mark that a parse is in progress to prevent race conditions
      parseInProgress.current = true;

      // Update the preloaded audio
      const { englishDuration, spanishDuration } = await preloadAudio({
        english: example.englishAudio,
        spanish: example.spanishAudio,
      });

      if (spanishDuration && englishDuration) {
        // If it comes back valid, parse it
        const parsedExample = getAudioQuizExample(
          example,
          audioQuizType,
          spanishDuration,
          englishDuration,
          autoplay,
        );
        // Record the parsed example in the map
        if (audioQuizType === AudioQuizType.Speaking) {
          setParsedSpeakingExamples((prev) => ({
            ...prev,
            [example.id]: parsedExample as SpeakingQuizExample,
          }));
        } else {
          setParsedListeningExamples((prev) => ({
            ...prev,
            [example.id]: parsedExample as ListeningQuizExample,
          }));
        }
      } else {
        // Otherwise, mark the example as bad
        markExampleAsBad(example.id);
      }
      // either way, mark the parse as finished
      parseInProgress.current = false;
    },
    [
      safeExamples,
      parsedSpeakingExamples,
      parsedListeningExamples,
      audioQuizType,
      autoplay,
      preloadAudio,
      markExampleAsBad,
    ],
  );

  // These references are for the audio-quiz-specific types.
  const currentAudioExample: SpeakingQuizExample | ListeningQuizExample | null =
    useMemo(() => {
      // If the current example is parsed, return it
      if (audioQuizType === AudioQuizType.Speaking) {
        const parsedExample =
          parsedSpeakingExamples[currentExampleMemo?.id ?? -1];
        return parsedExample ?? null;
      } else {
        const parsedExample =
          parsedListeningExamples[currentExampleMemo?.id ?? -1];
        return parsedExample ?? null;
      }
    }, [
      currentExampleMemo,
      parsedSpeakingExamples,
      parsedListeningExamples,
      audioQuizType,
    ]);

  const currentExampleReady = useMemo(() => {
    if (!currentAudioExample) {
      return false;
    }
    if (
      !(currentAudioExample.question.duration > 0) ||
      !(currentAudioExample.guess.duration > 0) ||
      !(currentAudioExample.hint.duration > 0) ||
      !(currentAudioExample.answer.duration > 0)
    ) {
      return false;
    }
    return true;
  }, [currentAudioExample]);

  const nextAudioExample: SpeakingQuizExample | ListeningQuizExample | null =
    useMemo(() => {
      // If the next example is not parsed, parse it
      if (audioQuizType === AudioQuizType.Speaking) {
        const parsedExample = parsedSpeakingExamples[nextExampleMemo?.id ?? -1];
        return parsedExample ?? null;
      } else {
        const parsedExample =
          parsedListeningExamples[nextExampleMemo?.id ?? -1];
        return parsedExample ?? null;
      }
    }, [
      nextExampleMemo,
      parsedSpeakingExamples,
      parsedListeningExamples,
      audioQuizType,
    ]);

  const nextExampleReady = useMemo(() => {
    return nextAudioExample !== null;
  }, [nextAudioExample]);

  const previousAudioExample:
    | SpeakingQuizExample
    | ListeningQuizExample
    | null = useMemo(() => {
    if (audioQuizType === AudioQuizType.Speaking) {
      const parsedExample =
        parsedSpeakingExamples[previousExampleMemo?.id ?? -1];
      if (previousExampleMemo?.id && !parsedExample) {
        console.error(
          'Example with id',
          previousExampleMemo.id,
          'was skipped in parsing!',
        );
        parseAudioExample(currentExampleIndex - 1);
        return null;
      }
      return parsedExample ?? null;
    } else {
      const parsedExample =
        parsedListeningExamples[previousExampleMemo?.id ?? -1];
      if (previousExampleMemo?.id && !parsedExample) {
        console.error(
          'Example with id',
          previousExampleMemo.id,
          'was skipped in parsing!',
        );
        parseAudioExample(currentExampleIndex - 1);
        return null;
      }
      return parsedExample ?? null;
    }
  }, [
    previousExampleMemo,
    parsedSpeakingExamples,
    parsedListeningExamples,
    audioQuizType,
    parseAudioExample,
    currentExampleIndex,
  ]);

  const previousExampleReady = useMemo(() => {
    return previousAudioExample !== null;
  }, [previousAudioExample]);

  // Get the values related to the current step
  const currentStepValue = useMemo(() => {
    if (!currentAudioExample) {
      return null;
    }
    switch (currentStep) {
      case AudioQuizStep.Question:
        return currentAudioExample.question;
      case AudioQuizStep.Guess:
        return currentAudioExample.guess;
      case AudioQuizStep.Hint:
        return currentAudioExample.hint;
      case AudioQuizStep.Answer:
        return currentAudioExample.answer;
      default:
        console.error('Invalid currentStep value: ', currentStep);
        return null;
    }
  }, [currentStep, currentAudioExample]);

  // Calculates the progress status of the current step, including the padding if autoplay is on
  const progressStatus = useMemo(() => {
    if (!currentStepValue || !currentStepValue.duration) {
      return 0;
    }
    // If audio has entered the padding, return the progress status of the padding
    if (
      autoplay &&
      'padAudioDuration' in currentStepValue &&
      isInPadding.current
    ) {
      return (
        (currentStepValue.duration -
          currentStepValue.padAudioDuration +
          currentTime) /
        currentStepValue.duration
      );
    }
    return currentTime / currentStepValue.duration;
  }, [currentTime, currentStepValue, autoplay]);

  // If autoplay and padding is needed, play the padding audio
  const playPaddingAudio = useCallback(() => {
    if (
      autoplay &&
      currentStepValue &&
      'padAudioDuration' in currentStepValue &&
      !isInPadding.current
    ) {
      isInPadding.current = true;
      changeCurrentAudio({
        currentTime: 0,
        src: currentStepValue.padAudioUrl,
        onEnded: nextStep,
        playOnLoad: true,
      });
    }
  }, [autoplay, currentStepValue, changeCurrentAudio, nextStep]);

  // What to do when the audio ends
  const onEndedCallback = useCallback(() => {
    if (!autoplay) {
      return;
    }
    if (currentStepValue && 'padAudioDuration' in currentStepValue) {
      playPaddingAudio();
    } else {
      nextStep();
    }
  }, [autoplay, currentStepValue, playPaddingAudio, nextStep]);

  // Complex effect to handle changes to the example or step
  useEffect(() => {
    // Do not proceed with the changes unless the audio is ready to be played
    if (!currentExampleReady) {
      // Parse the current audio example
      parseAudioExample(currentExampleIndex);
      return;
    }
    if (!nextExampleReady) {
      // Parse the next audio example
      parseAudioExample(currentExampleIndex + 1);
    }
    if (!ready) {
      return;
    }
    if (
      currentExampleIndex !== previousExampleIndexRef.current &&
      currentStepValue
    ) {
      // If the example index has changed, handle the example change
      previousExampleIndexRef.current = currentExampleIndex;
      isInPadding.current = false;
      // Handle example change
      changeCurrentAudio({
        currentTime: 0,
        src: currentStepValue.audioUrl,
        onEnded: onEndedCallback,
        playOnLoad: true,
      });
    } else if (currentStep !== previousStepRef.current && currentStepValue) {
      // If the step has changed but the step has, handle the step change
      previousStepRef.current = currentStep;
      isInPadding.current = false;
      // Handle step change
      changeCurrentAudio({
        currentTime: 0,
        src: currentStepValue.audioUrl,
        onEnded: onEndedCallback,
        playOnLoad: true,
      });
    }
  }, [
    ready,
    currentExampleReady,
    nextExampleReady,
    currentStep,
    currentExampleIndex,
    currentStepValue,
    changeCurrentAudio,
    parseAudioExample,
    onEndedCallback,
  ]);

  return {
    currentExample: currentExampleMemo ?? null, // Otherwise the example data is not loaded
    currentStep, // The current step of the quiz
    currentStepValue: currentStepValue ?? null, // Otherwise the current audio is still parsing
    currentExampleReady, // Whether the current example is ready to be played
    nextExampleReady, // Whether the next example is ready to be played
    previousExampleReady, // Whether the previous example is ready to be played
    isPlaying,
    pause, // Pauses the current audio
    play,
    nextStep,
    goToQuestion,
    goToHint,
    goToAnswer,
    nextExample,
    previousExample,
    progressStatus,
    currentExampleNumber,
    quizLength: safeExamples.length,
    resetQuiz,
  };
}
