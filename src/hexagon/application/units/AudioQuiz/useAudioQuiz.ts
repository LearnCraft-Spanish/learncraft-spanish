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
import silence2s from 'src/assets/audio/2s.mp3';

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
  currentExample: ExampleWithVocabulary | undefined;
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
  pause: () => Promise<void>;
  play: () => Promise<void>;
  nextStep: () => void;
  goToQuestion: () => void;
  goToGuess: () => void;
  goToHint: () => void;
  goToAnswer: () => void;
  restartCurrentStep: () => void;
  nextExample: () => void;
  previousExample: () => void;
  quizLength: number;
  cleanupFunction: () => void;
  isQuizComplete: boolean;
  restartQuiz: () => void;
  // Get Help
  getHelpIsOpen: boolean;
  setGetHelpIsOpen: (getHelpIsOpen: boolean) => void;
  vocabComplete: boolean;
  vocabulary: Vocabulary[];
  // Add/Pending/Remove Button
  addPendingRemoveProps: AddPendingRemoveProps | undefined;
}

// Extra silence played after hint/answer audio ends during autoplay (seconds).
// Uses a real silence audio file to maintain the browser permission chain.
const AUDIO_QUIZ_BUFFER_SECONDS = 2;

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
  const {
    play,
    pause,
    isPlaying: _isPlaying,
    currentTime,
    changeCurrentAudio,
    cleanupAudio,
  } = useAudioAdapter();
  const { isStudent } = useAuthAdapter();
  const {
    isExampleCollected,
    isAddingFlashcard,
    isRemovingFlashcard,
    isCustomFlashcard,
    createFlashcards,
    deleteFlashcards,
  } = useStudentFlashcards();

  const { parseExampleForQuiz } = useAudioQuizMapper();

  const [getHelpIsOpen, setGetHelpIsOpen] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  // Examples that have bad audio and should be skipped
  const [badAudioExamples, setBadAudioExamples] = useState<number[]>([]);
  const examplesConsideredForParsing = useRef<number[]>([]);

  // Marks an example as bad, removing it from the review list
  const markExampleAsBad = useCallback((exampleId: number) => {
    console.error('unplayable example found with id', exampleId);
    setBadAudioExamples((prev: number[]) => [...prev, exampleId]);
  }, []);

  // The examples to reviw, but with invalid audio filtered out
  const safeExamples = useMemo(() => {
    const toReturn = examplesToQuiz.filter((example) => {
      if (badAudioExamples.includes(example.id)) {
        return false;
      }
      return true;
    });
    return toReturn;
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
  const previousRestartTriggerRef = useRef<number>(0);

  // State to trigger audio restart without changing step or example
  const [restartTrigger, setRestartTrigger] = useState<number>(0);

  const stepHasBuffer =
    autoplay &&
    (currentStep === AudioQuizStep.Hint ||
      currentStep === AudioQuizStep.Answer);

  // Buffer tracking: true when silence audio is playing after hint/answer
  const isInBufferRef = useRef(false);
  // Duration of the audio portion that preceded the current buffer
  const audioPortionDurationRef = useRef(0);
  // When the current step's audio started (for timer-driven progress so UI is seamless across step→buffer transition)
  const stepStartTimeRef = useRef(0);
  // When user pauses on a buffered step, store elapsed so the progress bar freezes (no jump on resume)
  const pausedElapsedRef = useRef<number | null>(null);
  // One-shot guard: only one of timer or bufferEndedCallback may call nextStep per buffer phase
  const timerFiredRef = useRef(false);
  // Ticks every 50ms during buffered steps so progressStatus re-renders from elapsed time
  const [bufferProgressTick, setBufferProgressTick] = useState(0);

  const cleanupBuffer = useCallback((): void => {
    isInBufferRef.current = false;
    audioPortionDurationRef.current = 0;
    pausedElapsedRef.current = null;
    timerFiredRef.current = false;
  }, []);

  // The current example number (1-indexed for UI purposes)
  // Used only in export for UI, should not be referenced for stateful logic
  const currentExampleNumber = currentExampleIndex + 1; // 1-indexed

  // Audio examples are parsed on the fly
  // This is a map of example id to the parsed example
  const [parsedExamples, setParsedExamples] = useState<
    Record<number, AudioQuizExample>
  >({});

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

  // Parses the audio example at the given index
  const parseAudioExample = useCallback(
    async (safeIndex: number) => {
      if (
        safeExamples[safeIndex]?.id &&
        examplesConsideredForParsing.current.includes(
          safeExamples[safeIndex].id,
        )
      ) {
        return;
      }
      // Mark that a parse is in progress to prevent race conditions
      examplesConsideredForParsing.current.push(safeExamples[safeIndex].id);

      // Get the example to parse
      const example = safeExamples[safeIndex];

      // If the example is out of bounds or already parsed, return
      if (!example || parsedExamples[example.id]) {
        // Mark the parse as finished
        return;
      }

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
      }
    },
    [safeExamples, parsedExamples, parseExampleForQuiz, markExampleAsBad],
  );

  // These references are for the audio-quiz-specific types.
  const currentAudioExample: SpeakingQuizExample | ListeningQuizExample | null =
    useMemo(() => {
      if (!currentExampleMemo) {
        return null;
      }
      const parsedExample: AudioQuizExample | undefined =
        parsedExamples[currentExampleMemo?.id];
      if (!parsedExample) {
        parseAudioExample(currentExampleIndex);
        return null;
      }

      // Return the appropriate quiz type based on current quiz type
      return audioQuizType === AudioQuizType.Speaking
        ? parsedExample.speaking
        : parsedExample.listening;
    }, [
      parsedExamples,
      currentExampleMemo,
      audioQuizType,
      parseAudioExample,
      currentExampleIndex,
    ]);

  const currentExampleReady = useMemo(() => {
    return currentAudioExample !== null;
  }, [currentAudioExample]);

  const nextAudioExample: SpeakingQuizExample | ListeningQuizExample | null =
    useMemo(() => {
      if (!nextExampleMemo) {
        return null;
      }
      const parsedExample: AudioQuizExample | undefined =
        parsedExamples[nextExampleMemo.id];
      if (!parsedExample) {
        if (
          !examplesConsideredForParsing.current.includes(nextExampleMemo.id)
        ) {
          parseAudioExample(currentExampleIndex + 1);
        }
        return null;
      }

      // Return the appropriate quiz example type based on current quiz type
      return audioQuizType === AudioQuizType.Speaking
        ? parsedExample.speaking
        : parsedExample.listening;
    }, [
      parsedExamples,
      currentExampleIndex,
      nextExampleMemo,
      examplesConsideredForParsing,
      audioQuizType,
      parseAudioExample,
    ]);

  const nextExampleReady = useMemo(() => {
    return nextAudioExample !== null;
  }, [nextAudioExample]);

  const previousAudioExample:
    | SpeakingQuizExample
    | ListeningQuizExample
    | null = useMemo(() => {
    if (!previousExampleMemo) {
      return null;
    }
    const parsedExample: AudioQuizExample | undefined =
      parsedExamples[previousExampleMemo?.id];
    if (!parsedExample && previousExampleMemo?.id) {
      if (
        !examplesConsideredForParsing.current.includes(previousExampleMemo.id)
      ) {
        parseAudioExample(currentExampleIndex - 1);
      }
      return null;
    }

    // Return the appropriate quiz type based on current quiz type
    return audioQuizType === AudioQuizType.Speaking
      ? parsedExample.speaking
      : parsedExample.listening;
  }, [
    parsedExamples,
    previousExampleMemo,
    currentExampleIndex,
    audioQuizType,
    parseAudioExample,
    examplesConsideredForParsing,
  ]);

  const previousExampleReady = useMemo(() => {
    return previousAudioExample !== null;
  }, [previousAudioExample]);

  const nextExample = useCallback(() => {
    cleanupBuffer();
    if (nextExampleReady) {
      setSelectedExampleIndex(currentExampleIndex + 1);
      setCurrentStep(AudioQuizStep.Question);
      setGetHelpIsOpen(false);
      // Reset the previous step ref to null so progress animation works immediately on new example
      previousStepRef.current = null;
    } else if (currentExampleIndex === safeExamples.length - 1) {
      // We're at the last example and trying to go next, mark quiz as complete
      setIsQuizComplete(true);
      setGetHelpIsOpen(false);
      // Reset the previous step ref to null for restarted quiz
      previousStepRef.current = null;
    }
  }, [
    currentExampleIndex,
    safeExamples.length,
    setSelectedExampleIndex,
    nextExampleReady,
    cleanupBuffer,
  ]);

  const previousExample = useCallback(() => {
    cleanupBuffer();
    if (previousExampleReady) {
      // Go to the previous example if it is ready
      setSelectedExampleIndex(currentExampleIndex - 1);
      setCurrentStep(AudioQuizStep.Question);
      setGetHelpIsOpen(false);
      // Reset the previous step ref to null so progress animation works immediately on new example
      previousStepRef.current = null;
    }
  }, [
    currentExampleIndex,
    setSelectedExampleIndex,
    previousExampleReady,
    cleanupBuffer,
  ]);

  const restartQuiz = useCallback(() => {
    cleanupBuffer();
    setSelectedExampleIndex(0);
    setCurrentStep(AudioQuizStep.Question);
    previousStepRef.current = null;
    previousExampleIndexRef.current = -1;
    previousRestartTriggerRef.current = 0;
    setIsQuizComplete(false);

    // Clean up audio completely instead of just changing it
    cleanupAudio();

    if (getHelpIsOpen) {
      setGetHelpIsOpen(false);
    }
  }, [cleanupAudio, cleanupBuffer, getHelpIsOpen]);

  const goToQuestion = useCallback(() => {
    setCurrentStep(AudioQuizStep.Question);
  }, []);

  const goToGuess = useCallback(() => {
    setCurrentStep(AudioQuizStep.Guess);
  }, []);

  const goToHint = useCallback(() => {
    setCurrentStep(AudioQuizStep.Hint);
  }, []);

  const goToAnswer = useCallback(() => {
    setCurrentStep(AudioQuizStep.Answer);
  }, []);

  const restartCurrentStep = useCallback(() => {
    setRestartTrigger((prev) => prev + 1);
  }, []);

  // Steps the quiz forward
  const nextStep = useCallback(() => {
    switch (currentStep) {
      case AudioQuizStep.Question:
        if (autoplay) {
          goToGuess();
        } else {
          goToHint();
        }
        break;
      case AudioQuizStep.Guess:
        goToHint();
        break;
      case AudioQuizStep.Hint:
        goToAnswer();
        break;
      case AudioQuizStep.Answer:
        nextExample();
        break;
      default:
        console.error('Invalid currentStep value: ', currentStep);
    }
  }, [autoplay, currentStep, goToGuess, goToHint, goToAnswer, nextExample]);

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

    // If we're in the middle of an example change, always return 0 to prevent flash
    const exampleChanged =
      currentExampleIndex !== previousExampleIndexRef.current;
    if (exampleChanged) {
      return 0;
    }

    // If step just changed, return 0 for smooth reset
    const stepChanged =
      previousStepRef.current && currentStep !== previousStepRef.current;
    if (stepChanged) {
      return 0;
    }

    // If the step value is not ready, return 0
    if (!currentStepValue || !currentStepValue.duration) {
      return 0;
    }

    const duration = currentStepValue.duration;
    const effectiveDuration = stepHasBuffer
      ? duration + AUDIO_QUIZ_BUFFER_SECONDS
      : duration;

    // For buffered steps, drive progress from elapsed time so the UI is seamless.
    // When paused, use frozen elapsed so the bar doesn't jump on resume.
    let progress: number;
    if (stepHasBuffer && stepStartTimeRef.current > 0) {
      const elapsedSec =
        pausedElapsedRef.current !== null
          ? pausedElapsedRef.current
          : (Date.now() - stepStartTimeRef.current) / 1000;
      progress = elapsedSec / effectiveDuration;
    } else if (isInBufferRef.current) {
      progress =
        (audioPortionDurationRef.current + currentTime) / effectiveDuration;
    } else {
      progress = currentTime / effectiveDuration;
    }
    const finalProgress = Math.min(Math.max(progress, 0), 1);

    // bufferProgressTick is a dep of this memo (not used here) to force re-evaluation
    void bufferProgressTick;

    return finalProgress;
  }, [
    currentTime,
    currentStepValue,
    autoplay,
    previousStepRef,
    currentStep,
    currentExampleIndex,
    stepHasBuffer,
    bufferProgressTick,
  ]);

  // Ref to hold the latest nextStep so onEndedCallback and bufferEndedCallback
  // always call the current version without being in their dependency arrays.
  const nextStepRef = useRef(nextStep);
  nextStepRef.current = nextStep;

  // Called when the silence buffer audio ends
  const bufferEndedCallback = useCallback((): void => {
    if (!timerFiredRef.current) {
      timerFiredRef.current = true;
      isInBufferRef.current = false;
      audioPortionDurationRef.current = 0;
      nextStepRef.current();
    }
  }, []);

  // Called when any step's main audio ends
  const onEndedCallback = useCallback((): void => {
    if (!autoplay) {
      return;
    }

    if (stepHasBuffer) {
      const duration = currentStepValue?.duration ?? 0;
      timerFiredRef.current = false;
      isInBufferRef.current = true;
      audioPortionDurationRef.current = duration;
      changeCurrentAudio({
        currentTime: 0,
        src: silence2s,
        onEnded: bufferEndedCallback,
        playOnLoad: true,
      });
    } else {
      nextStepRef.current();
    }
  }, [
    autoplay,
    stepHasBuffer,
    currentStepValue,
    changeCurrentAudio,
    bufferEndedCallback,
  ]);

  const wrappedPause = useCallback(async (): Promise<void> => {
    if (stepHasBuffer && stepStartTimeRef.current > 0) {
      pausedElapsedRef.current = (Date.now() - stepStartTimeRef.current) / 1000;
    }
    await pause();
  }, [pause, stepHasBuffer]);

  const wrappedPlay = useCallback(async (): Promise<void> => {
    if (pausedElapsedRef.current !== null) {
      stepStartTimeRef.current = Date.now() - pausedElapsedRef.current * 1000;
      pausedElapsedRef.current = null;
    } else if (isInBufferRef.current) {
      const elapsedSoFar = audioPortionDurationRef.current + currentTime;
      stepStartTimeRef.current = Date.now() - elapsedSoFar * 1000;
    }
    await play();
  }, [play, currentTime]);

  // Preload the buffer silence file so the transition from step audio → buffer has minimal gap
  useEffect(() => {
    if (!ready || !autoplay) return;
    const preloadEl = new Audio(silence2s);
    preloadEl.preload = 'auto';
    preloadEl.load();
    return () => {
      preloadEl.src = '';
    };
  }, [ready, autoplay]);

  // Visual buffer: advance when elapsed time reaches step+2s (so UI is seamless; we may cut off silence early)
  useEffect(() => {
    if (
      !ready ||
      !autoplay ||
      !stepHasBuffer ||
      !currentStepValue?.duration ||
      !_isPlaying
    ) {
      return;
    }
    const effectiveDuration =
      currentStepValue.duration + AUDIO_QUIZ_BUFFER_SECONDS;
    const id = setInterval(() => {
      const elapsed = (Date.now() - stepStartTimeRef.current) / 1000;
      setBufferProgressTick((t) => t + 1);
      if (elapsed >= effectiveDuration) {
        if (!timerFiredRef.current) {
          timerFiredRef.current = true;
          nextStepRef.current();
        }
      }
    }, 50);
    return () => clearInterval(id);
  }, [
    ready,
    autoplay,
    stepHasBuffer,
    currentStepValue?.duration,
    _isPlaying,
    currentStep,
    currentExampleIndex,
  ]);

  // Effect to parse the audio examples when the current example is ready
  useEffect(() => {
    if (!currentExampleReady) {
      // Parse the current audio example
      parseAudioExample(currentExampleIndex);
    } else if (
      currentExampleReady &&
      !nextExampleReady &&
      nextExampleMemo?.id
    ) {
      // Parse the next audio example unless it has already been considered for parsing
      if (examplesConsideredForParsing.current.includes(nextExampleMemo.id)) {
        return;
      }
      parseAudioExample(currentExampleIndex + 1);
    } else if (
      currentExampleReady &&
      nextExampleReady &&
      !previousExampleReady
    ) {
      // Parse the previous audio example unless it has already been considered for parsing
      if (
        previousExampleMemo?.id &&
        !examplesConsideredForParsing.current.includes(previousExampleMemo.id)
      ) {
        parseAudioExample(currentExampleIndex - 1);
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
    nextExampleMemo,
    previousExampleMemo,
    parsedExamples,
  ]);

  // Complex effect to handle changes to the example, step, or restart trigger
  useEffect(() => {
    // Do not proceed with the changes unless the audio is ready to be played
    if (!ready || !currentStepValue) {
      return;
    }

    const exampleChanged =
      currentExampleIndex !== previousExampleIndexRef.current;
    const stepChanged = currentStep !== previousStepRef.current;
    const restartTriggerChanged =
      restartTrigger !== previousRestartTriggerRef.current;

    if (isQuizComplete) {
      cleanupBuffer();
      cleanupAudio();
      return;
    }

    const applyAudioChange = (): void => {
      pausedElapsedRef.current = null;
      stepStartTimeRef.current = Date.now();
      changeCurrentAudio({
        currentTime: 0,
        src: currentStepValue.mp3AudioUrl,
        onEnded: onEndedCallback,
        playOnLoad: true,
      });
    };

    if (exampleChanged) {
      cleanupBuffer();
      previousExampleIndexRef.current = currentExampleIndex;
      previousStepRef.current = currentStep;
      previousRestartTriggerRef.current = restartTrigger;
      applyAudioChange();
    } else if (stepChanged) {
      cleanupBuffer();
      previousStepRef.current = currentStep;
      previousRestartTriggerRef.current = restartTrigger;
      applyAudioChange();
    } else if (restartTriggerChanged) {
      cleanupBuffer();
      previousRestartTriggerRef.current = restartTrigger;
      applyAudioChange();
    }
  }, [
    ready,
    currentStep,
    currentExampleIndex,
    currentStepValue,
    restartTrigger,
    isQuizComplete,
    cleanupAudio,
    cleanupBuffer,
    changeCurrentAudio,
    onEndedCallback,
  ]);

  // Cleanup audio when the quiz component unmounts or cleanupFunction is called
  useEffect(() => {
    return () => {
      cleanupBuffer();
      cleanupAudio();
    };
  }, [cleanupAudio, cleanupBuffer]);

  // for getHelp
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

  // Add/Pending/Remove props
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
    currentStepValue: currentStepValue ?? null, // Otherwise the current audio is still parsing
    currentExample: currentExampleMemo, // The current example being quizzed
    currentExampleReady, // Whether the current example is ready to be played
    nextExampleReady, // Whether the next example is ready to be played
    previousExampleReady, // Whether the previous example is ready to be played
    isPlaying: _isPlaying,
    pause: wrappedPause,
    play: wrappedPlay,
    nextStep,
    goToQuestion,
    goToGuess,
    goToHint,
    goToAnswer,
    restartCurrentStep, // Restart the current step audio
    nextExample,
    previousExample,
    progressStatus,
    currentExampleNumber,
    quizLength: safeExamples.length,
    restartQuiz,
    cleanupFunction,
    isQuizComplete,
    getHelpIsOpen,
    setGetHelpIsOpen,
    vocabComplete,
    vocabulary,
    addPendingRemoveProps,
  };
}
