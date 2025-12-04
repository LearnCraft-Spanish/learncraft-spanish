import type { TextQuizReturn } from '@application/units/useTextQuiz';
import type { FlashcardForDisplay } from '@domain/quizzing';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

/**
 * Creates a mock FlashcardForDisplay from an example
 */
export function createMockFlashcardForDisplay(
  example: ExampleWithVocabulary,
  startWithSpanish = false,
): FlashcardForDisplay {
  return {
    question: {
      spanish: startWithSpanish,
      text: startWithSpanish ? example.spanish : example.english,
      hasAudio: startWithSpanish
        ? !!example.spanishAudio
        : !!example.englishAudio,
      audioUrl: startWithSpanish
        ? (example.spanishAudio ?? '')
        : (example.englishAudio ?? ''),
    },
    answer: {
      spanish: !startWithSpanish,
      text: startWithSpanish ? example.english : example.spanish,
      hasAudio: startWithSpanish
        ? !!example.englishAudio
        : !!example.spanishAudio,
      audioUrl: startWithSpanish
        ? (example.englishAudio ?? '')
        : (example.spanishAudio ?? ''),
      owned: false,
      addFlashcard: vi.fn<() => void>(),
      removeFlashcard: vi.fn<() => void>(),
      updateFlashcardInterval: vi.fn<() => void>(),
      vocabulary: example.vocabulary,
      vocabComplete: example.vocabularyComplete,
    },
    exampleIsCollected: false,
    exampleIsCustom: false,
    exampleIsAdding: false,
    exampleIsRemoving: false,
  };
}

/**
 * Creates a mock TextQuizReturn object for testing.
 * Use this when testing components that receive useTextQuizReturn as a prop.
 */
export function createMockTextQuizReturn(
  overrides?: Partial<TextQuizReturn>,
): TextQuizReturn {
  const defaults: TextQuizReturn = {
    examplesAreLoading: false,
    addPendingRemoveProps: undefined,
    quizExample: null,
    nextExample: vi.fn<() => void>(),
    previousExample: vi.fn<() => void>(),
    exampleNumber: 1,
    quizLength: 0,
    vocabInfoHook: vi.fn<() => ReturnType<TextQuizReturn['vocabInfoHook']>>(),
    currentExample: null,
    cleanupFunction: vi.fn<() => void>(),
    isQuizComplete: false,
    restartQuiz: vi.fn<() => void>(),
    answerShowing: false,
    toggleAnswer: vi.fn<() => void>(),
    getHelpIsOpen: false,
    setGetHelpIsOpen: vi.fn<() => void>(),
  };

  return { ...defaults, ...overrides };
}

/**
 * Creates a TextQuizReturn with examples pre-loaded.
 * Useful for tests that need realistic quiz data.
 */
export function createMockTextQuizReturnWithExamples(
  examples: ExampleWithVocabulary[],
  options?: {
    startWithSpanish?: boolean;
    currentIndex?: number;
  },
): TextQuizReturn {
  const { startWithSpanish = false, currentIndex = 0 } = options ?? {};
  const safeIndex = Math.min(Math.max(0, currentIndex), examples.length - 1);
  const currentExample = examples[safeIndex] ?? null;

  return createMockTextQuizReturn({
    quizExample: currentExample
      ? createMockFlashcardForDisplay(currentExample, startWithSpanish)
      : null,
    currentExample,
    exampleNumber: safeIndex + 1,
    quizLength: examples.length,
  });
}

// Default mock implementation for useTextQuiz hook
const defaultMockUseTextQuiz: TextQuizReturn = createMockTextQuizReturn();

export const {
  mock: mockUseTextQuiz,
  override: overrideMockUseTextQuiz,
  reset: resetMockUseTextQuiz,
} = createOverrideableMock<TextQuizReturn>(defaultMockUseTextQuiz);

export default mockUseTextQuiz;
