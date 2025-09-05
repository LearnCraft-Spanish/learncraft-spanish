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
    setBadAudioExamples((prev: number[]) => [...prev, exampleId]);
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

  // Simple utility functions to increment and decrement the example index
  const nextExample = useCallback(() => {
    if (currentExampleIndex + 1 < safeExamples.length - 1) {
      setSelectedExampleIndex(currentExampleIndex + 1);
      setCurrentStep(AudioQuizStep.Question);
    } else {
      setSelectedExampleIndex(safeExamples.length - 1);
      setCurrentStep(AudioQuizStep.Question);
    }
  }, [currentExampleIndex, setSelectedExampleIndex, safeExamples]);

  const previousExample = useCallback(() => {
    if (currentExampleIndex > 0) {
      setSelectedExampleIndex(currentExampleIndex - 1);
      setCurrentStep(AudioQuizStep.Question);
    } else {
      setSelectedExampleIndex(0);
      setCurrentStep(AudioQuizStep.Question);
    }
  }, [currentExampleIndex, setSelectedExampleIndex]);

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
  // Separated for listening and speaking quizzes
  const [parsedListeningExamples, setParsedListeningExamples] = useState<
    Record<number, ListeningQuizExample>
  >({});

  const [parsedSpeakingExamples, setParsedSpeakingExamples] = useState<
    Record<number, SpeakingQuizExample>
  >({});

  // Resets the quiz to the initial state, called on menu and end of autoplay
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

  // Parses the audio example at the given index
  const parseAudioExample = useCallback(
    async (safeIndex: number) => {
      // Get the example to parse
      const example = safeExamples[safeIndex];

      // If the next example is out of bounds, not ready, or already parsed, return
      if (
        safeIndex > safeExamples.length - 1 ||
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
          setParsedSpeakingExamples(
            (prev: Record<number, SpeakingQuizExample>) => ({
              ...prev,
              [example.id]: parsedExample as SpeakingQuizExample,
            }),
          );
        } else {
          setParsedListeningExamples(
            (prev: Record<number, ListeningQuizExample>) => ({
              ...prev,
              [example.id]: parsedExample as ListeningQuizExample,
            }),
          );
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
    if (!autoplay) {
      return 0;
    }

    if (
      previousStepRef.current &&
      currentStep &&
      currentStep !== previousStepRef.current
    ) {
      return 0;
    }

    // If the step value is not ready, return 0
    if (!currentStepValue || !currentStepValue.duration) {
      return 0;
    }

    // If audio has entered the padding, return the progress status of the padding
    if ('padAudioDuration' in currentStepValue && isInPadding.current) {
      const progress =
        (currentStepValue.duration -
          currentStepValue.padAudioDuration +
          currentTime) /
        currentStepValue.duration;
      return progress;
    }

    // Otherwise, return the progress status of the current step
    const progress = currentTime / currentStepValue.duration;
    return progress;
  }, [currentTime, currentStepValue, autoplay, previousStepRef, currentStep]);

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

  const goToQuestion = useCallback(() => {
    setCurrentStep(AudioQuizStep.Question);
    if (
      previousStepRef.current === AudioQuizStep.Question &&
      currentAudioExample
    ) {
      changeCurrentAudio({
        currentTime: 0,
        src: currentAudioExample?.question.audioUrl,
        onEnded: onEndedCallback,
        playOnLoad: true,
      });
    }
  }, [
    currentAudioExample,
    previousStepRef,
    changeCurrentAudio,
    onEndedCallback,
  ]);

  const goToHint = useCallback(() => {
    setCurrentStep(AudioQuizStep.Hint);
    if (previousStepRef.current === AudioQuizStep.Hint && currentAudioExample) {
      changeCurrentAudio({
        currentTime: 0,
        src: currentAudioExample?.hint.audioUrl,
        onEnded: onEndedCallback,
        playOnLoad: true,
      });
    }
  }, [
    currentAudioExample,
    previousStepRef,
    changeCurrentAudio,
    onEndedCallback,
  ]);

  const goToAnswer = useCallback(() => {
    setCurrentStep(AudioQuizStep.Answer);
    if (
      previousStepRef.current === AudioQuizStep.Answer &&
      currentAudioExample
    ) {
      changeCurrentAudio({
        currentTime: 0,
        src: currentAudioExample?.answer.audioUrl,
        onEnded: onEndedCallback,
        playOnLoad: true,
      });
    }
  }, [
    currentAudioExample,
    previousStepRef,
    changeCurrentAudio,
    onEndedCallback,
  ]);

  // Effect to parse the audio examples when the current example is ready
  useEffect(() => {
    if (!currentExampleReady) {
      // Parse the current audio example
      parseAudioExample(currentExampleIndex);
    } else if (currentExampleReady && !nextExampleReady) {
      // Parse the next audio example
      if (parseInProgress.current) {
        return;
      }
      parseAudioExample(currentExampleIndex + 1);
    } else if (
      currentExampleReady &&
      nextExampleReady &&
      !previousExampleReady
    ) {
      // Parse the previous audio example
      if (parseInProgress.current) {
        return;
      }
      parseAudioExample(currentExampleIndex - 1);
    }
  }, [
    currentExampleReady,
    nextExampleReady,
    previousExampleReady,
    currentExampleIndex,
    progressStatus,
    parseAudioExample,
  ]);

  // Complex effect to handle changes to the example or step
  useEffect(() => {
    // Do not proceed with the changes unless the audio is ready to be played
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
      // If the step has changed but the index has not, handle the step change
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
    return () => {
      changeCurrentAudio({
        currentTime: 0,
        src: '',
        onEnded: () => {},
        playOnLoad: true,
      });
    };
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
