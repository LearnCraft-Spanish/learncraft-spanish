import type { AddPendingRemoveProps } from '@application/units/useTextQuiz';
import type {
  AudioQuizAnswer,
  AudioQuizExample,
  AudioQuizGuess,
  AudioQuizHint,
  AudioQuizQuestion,
  ListeningQuizExample,
  SpeakingQuizExample,
} from '@domain/audioQuizzing';
import type {
  ExampleWithVocabulary,
  Vocabulary,
} from '@learncraft-spanish/shared';
import { useAudioAdapter } from '@application/adapters/audioAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useAudioQuizMapper } from '@application/units/useAudioQuizMapper';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface AudioQuizProps {
  examplesToQuiz: ExampleWithVocabulary[];
  audioQuizType: AudioQuizType;
  autoplay: boolean;
  ready: boolean; // Flag to prevent audio from playing in the background
  cleanupFunction: () => void;
}

export interface AudioQuizReturn {
  autoplay: boolean;
  audioQuizType: AudioQuizType;
  currentExampleNumber: number;
  currentExampleReady: boolean;
  currentStep: AudioQuizStep;
  isAudioTranscoderLoading: boolean;
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
  cleanupFunction: () => void;

  // Get Help
  getHelpIsOpen: boolean;
  setGetHelpIsOpen: (getHelpIsOpen: boolean) => void;
  vocabComplete: boolean;
  vocabulary: Vocabulary[];

  addPendingRemoveProps: AddPendingRemoveProps | undefined;
}

/**
 * Audio Quiz Orchestration Hook
 * =============================
 *
 * APPLICATION LAYER - Main Quiz Orchestration and State Management
 *
 * This is the central orchestration hook that manages the entire audio quiz
 * experience. It coordinates between audio transcoding, domain objects,
 * and UI state to provide a seamless quiz experience.
 *
 * RESPONSIBILITIES:
 * - Orchestrate audio quiz flow and state transitions
 * - Manage example parsing and audio preparation
 * - Handle quiz progression (question → hint → answer)
 * - Coordinate audio playback with quiz steps
 * - Manage bad audio examples and error handling
 * - Provide quiz controls and navigation
 *
 * ARCHITECTURAL POSITION:
 * - Layer: Application (Orchestration)
 * - Uses: AudioQuizMapper (business logic)
 * - Uses: AudioAdapter (playback infrastructure)
 * - Uses: StudentFlashcards (flashcard management)
 * - Used by: AudioQuiz.tsx (UI layer)
 *
 * STATE MANAGEMENT:
 * - Parsed examples cache for performance
 * - Bad audio examples tracking
 * - Current quiz step and example tracking
 * - Audio playback state coordination
 *
 * AUDIO PROCESSING FLOW:
 * 1. Parse examples using AudioQuizMapper
 * 2. Cache parsed audio for performance
 * 3. Handle audio failures gracefully
 * 4. Coordinate playback with quiz steps
 * 5. Manage audio cleanup and memory
 *
 * ERROR HANDLING:
 * - Marks unplayable examples as "bad"
 * - Continues quiz with remaining examples
 * - Provides fallback behavior for audio failures
 * - Maintains quiz integrity despite audio issues
 */
export function useAudioQuiz({
  examplesToQuiz,
  audioQuizType,
  autoplay,
  ready, // Flag to prevent audio from playing in the background
  cleanupFunction, // Function to clean up the quiz
}: AudioQuizProps): AudioQuizReturn {
  const { isStudent } = useAuthAdapter();
  const {
    isAddingFlashcard,
    isRemovingFlashcard,
    isExampleCollected,
    isCustomFlashcard,
    createFlashcards,
    deleteFlashcards,
  } = useStudentFlashcards();

  const { play, pause, isPlaying, currentTime, changeCurrentAudio } =
    useAudioAdapter();

  const { parseExampleForQuiz, isAudioTranscoderLoading } =
    useAudioQuizMapper();

  const [getHelpIsOpen, setGetHelpIsOpen] = useState(false);

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

  // Refs to track changes to the current example index and step
  const previousExampleIndexRef = useRef<number>(-1);
  const previousStepRef = useRef<AudioQuizStep | null>(null);

  // Simple utility functions to increment and decrement the example index
  const nextExample = useCallback(() => {
    if (currentExampleIndex + 1 < safeExamples.length - 1) {
      setSelectedExampleIndex(currentExampleIndex + 1);
      setCurrentStep(AudioQuizStep.Question);
    } else {
      setSelectedExampleIndex(safeExamples.length - 1);
      setCurrentStep(AudioQuizStep.Question);
    }
    setGetHelpIsOpen(false);

    // Reset the previous step ref to null so progress animation works immediately on new example
    previousStepRef.current = null;
  }, [currentExampleIndex, setSelectedExampleIndex, safeExamples]);

  const previousExample = useCallback(() => {
    if (currentExampleIndex > 0) {
      setSelectedExampleIndex(currentExampleIndex - 1);
      setCurrentStep(AudioQuizStep.Question);
    } else {
      setSelectedExampleIndex(0);
      setCurrentStep(AudioQuizStep.Question);
    }
    if (getHelpIsOpen) {
      setGetHelpIsOpen(false);
    }
    // Reset the previous step ref to null so progress animation works immediately on new example
    previousStepRef.current = null;
  }, [currentExampleIndex, setSelectedExampleIndex, getHelpIsOpen]);

  // Note: isInPadding ref removed - no longer needed with concatenated audio

  // The current example number (1-indexed for UI purposes)
  // Used only in export for UI, should not be referenced for stateful logic
  const currentExampleNumber = currentExampleIndex + 1; // 1-indexed

  // Audio examples are parsed on the fly
  // This is a map of example id to the parsed example
  const [parsedExamples, setParsedExamples] = useState<
    Record<number, AudioQuizExample>
  >({});

  // Store concatenated audio URLs, durations, and their cleanup functions for autoplay mode
  // Note: This is now handled by the AudioQuizMapper, so we can remove this complex state management

  // Resets the quiz to the initial state, called on menu and end of autoplay
  const resetQuiz = useCallback(() => {
    setSelectedExampleIndex(0);
    setCurrentStep(AudioQuizStep.Question);
    previousStepRef.current = null;
    previousExampleIndexRef.current = -1;

    changeCurrentAudio({
      currentTime: 0,
      src: '',
      onEnded: () => {},
      playOnLoad: true,
    });

    if (getHelpIsOpen) {
      setGetHelpIsOpen(false);
    }
  }, [changeCurrentAudio, getHelpIsOpen]);

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
  const currentExampleMemo = useMemo((): ExampleWithVocabulary | undefined => {
    if (safeExamples.length > 0) {
      return safeExamples[currentExampleIndex];
    }
  }, [safeExamples, currentExampleIndex]);

  const nextExampleMemo = useMemo((): ExampleWithVocabulary | undefined => {
    if (
      safeExamples.length > 0 &&
      currentExampleIndex + 1 < safeExamples.length
    ) {
      return safeExamples[currentExampleIndex + 1];
    }
  }, [safeExamples, currentExampleIndex]);

  const previousExampleMemo = useMemo((): ExampleWithVocabulary | undefined => {
    if (safeExamples.length > 0 && currentExampleIndex > 0) {
      return safeExamples[currentExampleIndex - 1];
    }
  }, [safeExamples, currentExampleIndex]);

  const vocabComplete = useMemo(() => {
    if (currentExampleMemo) {
      return currentExampleMemo.vocabularyComplete;
    }
    return false;
  }, [currentExampleMemo]);

  const vocabulary = useMemo(() => {
    if (currentExampleMemo) {
      return currentExampleMemo.vocabulary;
    }
    return [];
  }, [currentExampleMemo]);

  // Parses the audio example at the given index
  const parseAudioExample = useCallback(
    async (safeIndex: number) => {
      // Get the example to parse
      const example = safeExamples[safeIndex];

      // If the example is out of bounds or already parsed, return
      if (!example || parsedExamples[example.id]) {
        return;
      }

      // Mark that a parse is in progress to prevent race conditions
      parseInProgress.current = true;

      try {
        // Use our new simplified mapper to get both quiz types at once
        const { speaking, listening } = await parseExampleForQuiz(example);

        // Store both quiz examples
        setParsedExamples((prev) => ({
          ...prev,
          [example.id]: { speaking, listening },
        }));
      } catch (error) {
        console.error(`Failed to parse example ${example.id}:`, error);
        // Mark the example as bad
        markExampleAsBad(example.id);
      } finally {
        // Mark the parse as finished
        parseInProgress.current = false;
      }
    },
    [safeExamples, parsedExamples, parseExampleForQuiz, markExampleAsBad],
  );

  // Enhanced nextExample function with aggressive prefetching for autoplay
  const nextExampleWithPrefetch = useCallback(() => {
    // Call the original nextExample logic
    if (currentExampleIndex + 1 < safeExamples.length - 1) {
      setSelectedExampleIndex(currentExampleIndex + 1);
      setCurrentStep(AudioQuizStep.Question);
    } else {
      setSelectedExampleIndex(safeExamples.length - 1);
      setCurrentStep(AudioQuizStep.Question);
    }
    // Reset the previous step ref to null so progress animation works immediately on new example
    previousStepRef.current = null;

    // Trigger aggressive prefetching of upcoming examples when user is actively progressing
    if (autoplay && !parseInProgress.current) {
      const nextIndex = currentExampleIndex + 2; // Two examples ahead
      if (nextIndex < safeExamples.length) {
        const nextExample = safeExamples[nextIndex];
        if (nextExample && !parsedExamples[nextExample.id]) {
          // Prefetch in the background without blocking
          setTimeout(() => {
            if (!parseInProgress.current) {
              parseAudioExample(nextIndex);
            }
          }, 100);
        }
      }
    }
  }, [
    currentExampleIndex,
    setSelectedExampleIndex,
    safeExamples,
    autoplay,
    parsedExamples,
    parseAudioExample,
  ]);

  // These references are for the audio-quiz-specific types.
  const currentAudioExample: SpeakingQuizExample | ListeningQuizExample | null =
    useMemo(() => {
      const parsedExample = parsedExamples[currentExampleMemo?.id ?? -1];
      if (!parsedExample) {
        return null;
      }

      // Return the appropriate quiz type based on current quiz type
      return audioQuizType === AudioQuizType.Speaking
        ? parsedExample.speaking
        : parsedExample.listening;
    }, [parsedExamples, currentExampleMemo, audioQuizType]);

  const currentExampleReady = useMemo(() => {
    return currentAudioExample !== null;
  }, [currentAudioExample]);

  const nextAudioExample: SpeakingQuizExample | ListeningQuizExample | null =
    useMemo(() => {
      const parsedExample = parsedExamples[nextExampleMemo?.id ?? -1];
      if (!parsedExample) {
        return null;
      }

      // Return the appropriate quiz type based on current quiz type
      return audioQuizType === AudioQuizType.Speaking
        ? parsedExample.speaking
        : parsedExample.listening;
    }, [parsedExamples, nextExampleMemo, audioQuizType]);

  const nextExampleReady = useMemo(() => {
    return nextAudioExample !== null;
  }, [nextAudioExample]);

  const previousAudioExample:
    | SpeakingQuizExample
    | ListeningQuizExample
    | null = useMemo(() => {
    const parsedExample = parsedExamples[previousExampleMemo?.id ?? -1];
    if (!parsedExample) {
      return null;
    }

    // Return the appropriate quiz type based on current quiz type
    return audioQuizType === AudioQuizType.Speaking
      ? parsedExample.speaking
      : parsedExample.listening;
  }, [parsedExamples, previousExampleMemo, audioQuizType]);

  const previousExampleReady = useMemo(() => {
    return previousAudioExample !== null;
  }, [previousAudioExample]);

  // Get the values related to the current step
  const currentStepValue = useMemo(() => {
    if (!currentAudioExample || !currentExampleMemo) {
      return null;
    }

    let stepValue: any;

    switch (currentStep) {
      case AudioQuizStep.Question:
        stepValue = currentAudioExample.question;
        break;
      case AudioQuizStep.Guess:
        stepValue = currentAudioExample.guess;
        break;
      case AudioQuizStep.Hint:
        stepValue = currentAudioExample.hint;
        break;
      case AudioQuizStep.Answer:
        stepValue = currentAudioExample.answer;
        break;
      default:
        console.error('Invalid currentStep value: ', currentStep);
        return null;
    }

    return stepValue;
  }, [currentStep, currentAudioExample, currentExampleMemo]);

  // Calculates the progress status of the current step - simplified with concatenated audio
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

    // Simple progress calculation - concatenated audio handles padding seamlessly
    const progress = currentTime / currentStepValue.duration;
    return progress;
  }, [currentTime, currentStepValue, autoplay, previousStepRef, currentStep]);

  // What to do when the audio ends - simplified since concatenated audio handles padding
  const onEndedCallback = useCallback(() => {
    if (!autoplay) {
      return;
    }
    // No need for complex padding logic - concatenated audio handles it seamlessly
    nextStep();
  }, [autoplay, nextStep]);

  const goToQuestion = useCallback(() => {
    setCurrentStep(AudioQuizStep.Question);
    if (
      previousStepRef.current === AudioQuizStep.Question &&
      currentAudioExample
    ) {
      changeCurrentAudio({
        currentTime: 0,
        src: currentAudioExample?.question.blobUrl,
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
        src: currentAudioExample?.hint.blobUrl,
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
        src: currentAudioExample?.answer.blobUrl,
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
    } else if (
      currentExampleReady &&
      nextExampleReady &&
      previousExampleReady
    ) {
      // All adjacent examples are parsed, now prefetch blobs for better autoplay performance
      // Prefetch next 2 examples if they exist and aren't already parsed
      for (let i = currentExampleIndex + 2; i <= currentExampleIndex + 3; i++) {
        if (i < safeExamples.length && !parseInProgress.current) {
          const example = safeExamples[i];
          if (example && !parsedExamples[example.id]) {
            parseAudioExample(i);
            break; // Parse one at a time to avoid overwhelming the system
          }
        }
      }
    }
  }, [
    currentExampleReady,
    nextExampleReady,
    previousExampleReady,
    currentExampleIndex,
    progressStatus,
    parseAudioExample,
    safeExamples,
    audioQuizType,
    parsedExamples,
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
      // Handle example change
      changeCurrentAudio({
        currentTime: 0,
        src: currentStepValue.blobUrl,
        onEnded: onEndedCallback,
        playOnLoad: true,
      });
    } else if (currentStep !== previousStepRef.current && currentStepValue) {
      // If the step has changed but the index has not, handle the step change
      previousStepRef.current = currentStep;
      // Handle step change
      changeCurrentAudio({
        currentTime: 0,
        src: currentStepValue.blobUrl,
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

  /*
    addPendingRemoveProps: isStudent
      ? {
          isAdding: isAddingFlashcard({ exampleId: currentExample?.id ?? 0 }),
          isRemoving: isRemovingFlashcard({
            exampleId: currentExample?.id ?? 0,
          }),
          isCollected: isExampleCollected({
            exampleId: currentExample?.id ?? 0,
          }),
          addFlashcard,
          removeFlashcard,
        }
      : undefined,
  */

  // This is the memo for add pending remove
  const addFlashcard = useCallback(() => {
    if (
      !currentExampleMemo ||
      isExampleCollected({ exampleId: currentExampleMemo.id })
    ) {
      return;
    }
    createFlashcards([currentExampleMemo]);
  }, [currentExampleMemo, createFlashcards, isExampleCollected]);
  const removeFlashcard = useCallback(() => {
    if (
      !currentExampleMemo ||
      !isExampleCollected({ exampleId: currentExampleMemo.id })
    ) {
      return;
    }
    deleteFlashcards([currentExampleMemo.id]);
  }, [currentExampleMemo, deleteFlashcards, isExampleCollected]);

  const addPendingRemoveProps = useMemo(() => {
    if (!isStudent) {
      return undefined;
    }
    return {
      isAdding: isAddingFlashcard({ exampleId: currentExampleMemo?.id ?? 0 }),
      isRemoving: isRemovingFlashcard({
        exampleId: currentExampleMemo?.id ?? 0,
      }),
      isCollected: isExampleCollected({
        exampleId: currentExampleMemo?.id ?? 0,
      }),
      isCustom: isCustomFlashcard({ exampleId: currentExampleMemo?.id ?? 0 }),
      addFlashcard,
      removeFlashcard,
    };
  }, [
    isStudent,
    currentExampleMemo,
    addFlashcard,
    removeFlashcard,
    isAddingFlashcard,
    isRemovingFlashcard,
    isExampleCollected,
    isCustomFlashcard,
  ]);

  return {
    autoplay,
    audioQuizType,
    currentStep, // The current step of the quiz
    isAudioTranscoderLoading: isAudioTranscoderLoading(),
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
    nextExample: nextExampleWithPrefetch,
    previousExample,
    progressStatus,
    currentExampleNumber,
    quizLength: safeExamples.length,
    resetQuiz,
    cleanupFunction,

    // Get Help
    getHelpIsOpen,
    setGetHelpIsOpen,
    vocabComplete,
    vocabulary,

    addPendingRemoveProps,
  };
}
