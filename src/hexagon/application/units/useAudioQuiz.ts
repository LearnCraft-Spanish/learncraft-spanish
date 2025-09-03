import type {
  AudioQuizAnswer,
  AudioQuizGuess,
  AudioQuizHint,
  AudioQuizQuestion,
  AudioQuizType,
  ListeningQuizExample,
  SpeakingQuizExample,
} from '@domain/audioQuizzing';
import type { Example } from '@learncraft-spanish/shared';
import { useAudioAdapter } from '@application/adapters/audioAdapter';
import { AudioQuizStep } from '@domain/audioQuizzing';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAudioQuizExample } from '../utils/audioQuizzingMappers';

interface AudioQuizProps {
  examplesToQuiz: Example[];
  audioQuizType: AudioQuizType;
  autoplay: boolean;
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
}

export function useAudioQuiz({
  examplesToQuiz,
  audioQuizType,
  autoplay,
}: AudioQuizProps): AudioQuizReturn {
  const {
    play,
    pause,
    isPlaying,
    currentTime,
    changeCurrentAudio,
    updateCurrentAudioQueue,
    updateNextAudioQueue,
  } = useAudioAdapter();

  // Examples that have bad audio and should be skipped
  const [badAudioExamples, setBadAudioExamples] = useState<number[]>([]);

  // Marks an example as bad, removing it from the review list
  const markExampleAsBad = useCallback((exampleId: number) => {
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
    if (selectedExampleIndex >= safeExamples.length) {
      return safeExamples.length - 1;
    }
    return selectedExampleIndex;
  }, [selectedExampleIndex, safeExamples.length]);

  // Simple utility functions to increment and decrement the example index
  const incrementExampleIndex = useCallback(() => {
    if (currentExampleIndex + 1 < safeExamples.length) {
      setSelectedExampleIndex(currentExampleIndex + 1);
    }
    setSelectedExampleIndex(safeExamples.length - 1);
  }, [currentExampleIndex, setSelectedExampleIndex, safeExamples.length]);

  const decrementExampleIndex = useCallback(() => {
    if (currentExampleIndex > 0) {
      setSelectedExampleIndex(currentExampleIndex - 1);
    }
    setSelectedExampleIndex(0);
  }, [currentExampleIndex, setSelectedExampleIndex]);

  // Ref to track changes to the current example index
  const previousExampleIndexRef = useRef<number>(0);

  // The current example number (1-indexed for UI purposes)
  // Used only in export for UI, should not be referenced for stateful logic
  const currentExampleNumber = currentExampleIndex + 1; // 1-indexed

  // Audio examples are parsed on the fly
  // This is a map of example id to the parsed example
  // This is used to avoid parsing the same example multiple times
  const [parsedAudioExamples, setParsedAudioExamples] = useState<
    Record<number, SpeakingQuizExample | ListeningQuizExample | null>
  >({});

  // The current review step for the current example
  const [currentStep, setCurrentStep] = useState<AudioQuizStep>(
    AudioQuizStep.Question,
  );

  // Ref to track changes to the current step
  const previousStepRef = useRef<AudioQuizStep>(AudioQuizStep.Question);

  // Ref used for autoplay to mark when the audio has entered the padding
  const isInPadding = useRef(false);

  // Simple memos for the current, next, and previous examples
  // Undefined if unavailable, implies either loading state or out of array bounds
  const currentExample = useMemo((): Example | undefined => {
    if (safeExamples.length > 0) {
      return safeExamples[currentExampleIndex];
    }
  }, [safeExamples, currentExampleIndex]);

  const nextExample = useMemo((): Example | undefined => {
    if (
      safeExamples.length > 0 &&
      currentExampleIndex + 1 < safeExamples.length
    ) {
      return safeExamples[currentExampleIndex + 1];
    }
  }, [safeExamples, currentExampleIndex]);

  const previousExample = useMemo((): Example | undefined => {
    if (safeExamples.length > 0 && currentExampleIndex > 0) {
      return safeExamples[currentExampleIndex - 1];
    }
  }, [safeExamples, currentExampleIndex]);

  const parseCurrentAudioExample = useCallback(
    async (newIndex: number) => {
      // Parsing the current example
      const thisExample = safeExamples[newIndex];

      // If the example is not ready, return
      if (!thisExample) {
        return;
      }

      // If example is already parsed, return
      if (parsedAudioExamples[thisExample.id]) {
        return;
      }
      const { englishDuration, spanishDuration } =
        await updateCurrentAudioQueue({
          english: thisExample.englishAudio,
          spanish: thisExample.spanishAudio,
        });

      // If it comes back valid, parse the example
      if (spanishDuration && englishDuration) {
        const parsedThisExample = getAudioQuizExample(
          thisExample,
          audioQuizType,
          spanishDuration,
          englishDuration,
          autoplay,
        );
        // Record the parsed example in the map
        setParsedAudioExamples((prev) => ({
          ...prev,
          [thisExample.id]: parsedThisExample,
        }));
        // Otherwise, mark the example as bad
      } else {
        markExampleAsBad(thisExample.id);
      }
    },
    [
      safeExamples,
      parsedAudioExamples,
      audioQuizType,
      autoplay,
      updateCurrentAudioQueue,
      markExampleAsBad,
    ],
  );

  const parseNextAudioExample = useCallback(
    async (newIndex: number) => {
      const nextExample = safeExamples[newIndex];

      // If the next example is out of bounds, return
      if (newIndex >= safeExamples.length) {
        return;
      }

      // If the next example is not ready, return
      if (!nextExample) {
        return;
      }

      // If the next example is already parsed, return
      if (parsedAudioExamples[nextExample.id]) {
        return;
      }

      // Update the next audio queue
      const { englishDuration, spanishDuration } = await updateNextAudioQueue({
        english: nextExample.englishAudio,
        spanish: nextExample.spanishAudio,
      });

      // If the next example comes back valid, parse it
      if (spanishDuration && englishDuration) {
        const parsedNextExample = getAudioQuizExample(
          nextExample,
          audioQuizType,
          spanishDuration,
          englishDuration,
          autoplay,
        );
        // Record the parsed example in the map
        setParsedAudioExamples((prev) => ({
          ...prev,
          [nextExample.id]: parsedNextExample,
        }));
        // Otherwise, mark the example as bad
      } else {
        markExampleAsBad(nextExample.id);
      }
    },
    [
      safeExamples,
      parsedAudioExamples,
      audioQuizType,
      autoplay,
      updateNextAudioQueue,
      markExampleAsBad,
    ],
  );

  // These references are for the audio-quiz-specific types.
  const currentAudioExample: SpeakingQuizExample | ListeningQuizExample | null =
    useMemo(() => {
      // If the current example is not ready, return null
      if (!currentExample) {
        return null;
      }

      // If the current example is parsed, return it
      if (parsedAudioExamples[currentExample.id]) {
        return parsedAudioExamples[currentExample.id];
        // Otherwise, parse it and return null until it is parsed
      } else {
        parseCurrentAudioExample(currentExampleIndex);
        return null;
      }
    }, [
      currentExample,
      parsedAudioExamples,
      currentExampleIndex,
      parseCurrentAudioExample,
    ]);

  const nextAudioExample: SpeakingQuizExample | ListeningQuizExample | null =
    useMemo(() => {
      if (!nextExample) {
        return null;
      }

      // If the next example is not parsed, parse it
      const parsedExample = parsedAudioExamples[nextExample.id];
      if (!!nextExample && !parsedExample) {
        parseNextAudioExample(currentExampleIndex + 1);
      }
      return parsedExample;
    }, [
      nextExample,
      parsedAudioExamples,
      currentExampleIndex,
      parseNextAudioExample,
    ]);

  const previousAudioExample:
    | SpeakingQuizExample
    | ListeningQuizExample
    | null = useMemo(() => {
    if (!previousExample) return null;
    const parsedExample = parsedAudioExamples[previousExample.id];

    // If the previous example is not parsed, parse it
    // This generally shouldn't happen since examples are parsed ahead of the user
    if (!!previousExample && !parsedExample) {
      parseNextAudioExample(currentExampleIndex - 1);
    }
    return parsedExample;
  }, [
    previousExample,
    currentExampleIndex,
    parsedAudioExamples,
    parseNextAudioExample,
  ]);

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

  // Calculates the duration of the current step, including the padding if autoplay is on
  const currentStepDuration = useMemo(() => {
    if (!currentStepValue) {
      return null;
    }
    if ('padAudioDuration' in currentStepValue && autoplay) {
      return currentStepValue.duration + currentStepValue.padAudioDuration;
    }
    return currentStepValue.duration;
  }, [autoplay, currentStepValue]);

  // Calculates the progress status of the current step, including the padding if autoplay is on
  const progressStatus = useMemo(() => {
    if (!currentStepValue || !currentTime || !currentStepDuration) {
      return 0;
    }
    if (
      autoplay &&
      'padAudioDuration' in currentStepValue &&
      isInPadding.current
    ) {
      return currentStepValue.duration + currentTime / currentStepDuration;
    }
    return currentTime / currentStepDuration;
  }, [currentTime, currentStepDuration, currentStepValue, autoplay]);

  // Steps the quiz forward
  const incrementCurrentStep = useCallback(() => {
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
        incrementExampleIndex();
        // Proceed to next question
        break;
      default:
        console.error('Invalid currentStep value: ', currentStep);
    }
  }, [autoplay, currentStep, incrementExampleIndex]);

  const goToQuestion = useCallback(() => {
    setCurrentStep(AudioQuizStep.Question);
  }, []);

  const goToHint = useCallback(() => {
    setCurrentStep(AudioQuizStep.Hint);
  }, []);

  const goToAnswer = useCallback(() => {
    setCurrentStep(AudioQuizStep.Answer);
  }, []);

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
        playing: true,
        currentTime: 0,
        src: currentStepValue.padAudioUrl,
        onEnded: incrementCurrentStep,
      });
    }
  }, [autoplay, currentStepValue, changeCurrentAudio, incrementCurrentStep]);

  // What to do when the audio ends
  const onEndedCallback = useCallback(() => {
    if (!autoplay) {
      return;
    }
    if (currentStepValue && 'padAudioDuration' in currentStepValue) {
      playPaddingAudio();
    } else {
      incrementCurrentStep();
    }
  }, [autoplay, currentStepValue, playPaddingAudio, incrementCurrentStep]);

  // Complex effect to handle changes to the example or step
  useEffect(() => {
    if (
      currentExampleIndex !== previousExampleIndexRef.current &&
      currentStepValue
    ) {
      previousExampleIndexRef.current = currentExampleIndex;
      isInPadding.current = false;
      // Handle example change
      changeCurrentAudio({
        playing: true,
        currentTime: 0,
        src: currentStepValue.audioUrl,
        onEnded: onEndedCallback,
      });
    } else if (currentStep !== previousStepRef.current && currentStepValue) {
      previousStepRef.current = currentStep;
      isInPadding.current = false;
      // Handle step change
      changeCurrentAudio({
        playing: true,
        currentTime: 0,
        src: currentStepValue.audioUrl,
        onEnded: onEndedCallback,
      });
    }
  }, [
    currentStep,
    currentExampleIndex,
    currentAudioExample,
    currentStepValue,
    changeCurrentAudio,
    onEndedCallback,
  ]);

  return {
    currentExample: currentExample ?? null, // Otherwise the example data is not loaded
    currentStep,
    currentStepValue: currentStepValue ?? null, // Otherwise the current audio is still parsing
    currentExampleReady: !!currentAudioExample, // Otherwise the quiz is still loading
    nextExampleReady: !!nextAudioExample, // Otherwise prevent advancing to next example
    previousExampleReady: !!previousAudioExample, // Otherwise prevent advancing to previous example
    isPlaying,
    pause,
    play,
    nextStep: incrementCurrentStep,
    goToQuestion,
    goToHint,
    goToAnswer,
    nextExample: incrementExampleIndex,
    previousExample: decrementExampleIndex,
    progressStatus,
    currentExampleNumber,
    quizLength: safeExamples.length,
  };
}
