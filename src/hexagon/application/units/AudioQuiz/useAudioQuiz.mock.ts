import type { AudioQuizReturn } from '@application/units/AudioQuiz/useAudioQuiz';
import type {
  AudioQuizAnswer,
  AudioQuizGuess,
  AudioQuizHint,
  AudioQuizQuestion,
} from '@domain/audioQuizzing';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

/**
 * Creates a mock AudioQuizQuestion step value
 */
export function createMockAudioQuizQuestion(
  overrides?: Partial<AudioQuizQuestion>,
): AudioQuizQuestion {
  return {
    step: AudioQuizStep.Question,
    spanish: false,
    displayText: 'Playing English',
    mp3AudioUrl: 'http://example.com/question.mp3',
    duration: 1.0,
    ...overrides,
  };
}

/**
 * Creates a mock AudioQuizGuess step value
 */
export function createMockAudioQuizGuess(
  overrides?: Partial<AudioQuizGuess>,
): AudioQuizGuess {
  return {
    step: AudioQuizStep.Guess,
    spanish: false,
    displayText: 'Make a guess',
    mp3AudioUrl: 'http://example.com/guess.mp3',
    duration: 0,
    ...overrides,
  };
}

/**
 * Creates a mock AudioQuizHint step value
 */
export function createMockAudioQuizHint(
  overrides?: Partial<AudioQuizHint>,
): AudioQuizHint {
  return {
    step: AudioQuizStep.Hint,
    spanish: true,
    displayText: 'Here is a hint',
    mp3AudioUrl: 'http://example.com/hint.mp3',
    duration: 1.0,
    ...overrides,
  };
}

/**
 * Creates a mock AudioQuizAnswer step value
 */
export function createMockAudioQuizAnswer(
  overrides?: Partial<AudioQuizAnswer>,
): AudioQuizAnswer {
  return {
    step: AudioQuizStep.Answer,
    spanish: true,
    displayText: 'The answer',
    mp3AudioUrl: 'http://example.com/answer.mp3',
    duration: 1.0,
    ...overrides,
  };
}

/**
 * Creates a mock step value based on the current step
 */
export function createMockStepValue(
  step: AudioQuizStep,
  example?: ExampleWithVocabulary,
  audioQuizType: AudioQuizType = AudioQuizType.Speaking,
): AudioQuizQuestion | AudioQuizGuess | AudioQuizHint | AudioQuizAnswer {
  switch (step) {
    case AudioQuizStep.Question:
      return createMockAudioQuizQuestion({
        spanish: audioQuizType === AudioQuizType.Listening,
        displayText:
          audioQuizType === AudioQuizType.Speaking
            ? 'Playing English'
            : 'Listen to audio',
        mp3AudioUrl: example?.englishAudio ?? 'http://example.com/question.mp3',
      });
    case AudioQuizStep.Guess:
      return createMockAudioQuizGuess();
    case AudioQuizStep.Hint:
      return createMockAudioQuizHint({
        displayText: example?.english ?? 'Here is a hint',
        mp3AudioUrl: example?.englishAudio ?? 'http://example.com/hint.mp3',
      });
    case AudioQuizStep.Answer:
      return createMockAudioQuizAnswer({
        spanish: audioQuizType === AudioQuizType.Speaking,
        displayText: example?.spanish ?? 'The answer',
        mp3AudioUrl: example?.spanishAudio ?? 'http://example.com/answer.mp3',
      });
  }
}

/**
 * Creates a mock AudioQuizReturn object for testing.
 * Use this when testing components that receive audioQuizReturn as a prop.
 */
export function createMockAudioQuizReturn(
  overrides?: Partial<AudioQuizReturn>,
): AudioQuizReturn {
  const defaults: AudioQuizReturn = {
    autoplay: false,
    audioQuizType: AudioQuizType.Speaking,
    currentExampleNumber: 1,
    currentExample: undefined,
    currentExampleReady: true,
    currentStep: AudioQuizStep.Question,
    currentStepValue: createMockAudioQuizQuestion(),
    nextExampleReady: false,
    previousExampleReady: false,
    progressStatus: 0,
    isPlaying: false,
    pause: vi.fn<() => void>(),
    play: vi.fn<() => void>(),
    nextStep: vi.fn<() => void>(),
    goToQuestion: vi.fn<() => void>(),
    goToGuess: vi.fn<() => void>(),
    goToHint: vi.fn<() => void>(),
    goToAnswer: vi.fn<() => void>(),
    restartCurrentStep: vi.fn<() => void>(),
    nextExample: vi.fn<() => void>(),
    previousExample: vi.fn<() => void>(),
    quizLength: 0,
    cleanupFunction: vi.fn<() => void>(),
    isQuizComplete: false,
    restartQuiz: vi.fn<() => void>(),
    getHelpIsOpen: false,
    setGetHelpIsOpen: vi.fn<() => void>(),
    vocabComplete: false,
    vocabulary: [],
    addPendingRemoveProps: undefined,
  };

  return { ...defaults, ...overrides };
}

/**
 * Creates an AudioQuizReturn with examples pre-loaded.
 * Useful for tests that need realistic quiz data.
 */
export function createMockAudioQuizReturnWithExamples(
  examples: ExampleWithVocabulary[],
  options?: {
    audioQuizType?: AudioQuizType;
    autoplay?: boolean;
    currentIndex?: number;
    currentStep?: AudioQuizStep;
  },
): AudioQuizReturn {
  const {
    audioQuizType = AudioQuizType.Speaking,
    autoplay = false,
    currentIndex = 0,
    currentStep = AudioQuizStep.Question,
  } = options ?? {};

  const safeIndex = Math.min(Math.max(0, currentIndex), examples.length - 1);
  const currentExample = examples[safeIndex];

  return createMockAudioQuizReturn({
    autoplay,
    audioQuizType,
    currentExample,
    currentExampleNumber: safeIndex + 1,
    currentStep,
    currentStepValue: createMockStepValue(
      currentStep,
      currentExample,
      audioQuizType,
    ),
    quizLength: examples.length,
    nextExampleReady: safeIndex < examples.length - 1,
    previousExampleReady: safeIndex > 0,
    vocabComplete: currentExample?.vocabularyComplete ?? false,
    vocabulary: currentExample?.vocabulary ?? [],
  });
}

// Default mock implementation for useAudioQuiz hook
const defaultMockUseAudioQuiz: AudioQuizReturn = createMockAudioQuizReturn();

export const {
  mock: mockUseAudioQuiz,
  override: overrideMockUseAudioQuiz,
  reset: resetMockUseAudioQuiz,
} = createOverrideableMock<AudioQuizReturn>(defaultMockUseAudioQuiz);

export default mockUseAudioQuiz;
