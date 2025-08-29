import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useCallback, useMemo, useState } from 'react';
import { applyQuizLengthRoundingRules } from './helpers';

interface QuizSettings {
  // Universal Quiz Settings
  quizType: 'text' | 'audio';
  userSelectedQuizLength: number;

  // Text Quiz Settings
  startWithSpanish: boolean;
  srsQuiz: boolean;
  customOnly: boolean;

  // Audio Quiz Settings
  audioQuizVariant: 'speaking' | 'listening';
  autoplay: boolean;
}

export interface QuizSetupOptions {
  availableFlashcards: Flashcard[];
  maximumQuizLength: number;
  hasCustomFlashcards: boolean;
  quizSettings: QuizSettings;
  updateQuizSettings: (
    key: keyof QuizSettings,
    value: QuizSettings[keyof QuizSettings],
  ) => void;
}

interface UseQuizMyFlashcardsReturn {
  quizSetupOptions: QuizSetupOptions;
  quizReady: boolean;
  setQuizReady: (quizReady: boolean) => void;
  setupQuiz: () => ExampleWithVocabulary[] | null;

  myFlashcardsLoading: boolean;
  myFlashcardsError: Error | null;
}

export function useQuizMyFlashcards(): UseQuizMyFlashcardsReturn {
  const [quizReady, setQuizReady] = useState(false);

  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    quizType: 'text',
    userSelectedQuizLength: 0,
    startWithSpanish: false,
    srsQuiz: true,
    customOnly: false,
    audioQuizVariant: 'speaking',
    autoplay: true,
  });

  const {
    flashcards,
    flashcardsDueForReview,
    customFlashcards,
    customFlashcardsDueForReview,
    audioFlashcards,
    isLoading,
    error,
    getRandomFlashcards,
  } = useStudentFlashcards();

  const filteredFlashcards: Flashcard[] = useMemo(() => {
    const quizType = quizSettings.quizType;
    const srsQuiz = quizSettings.srsQuiz;
    const customOnly = quizSettings.customOnly;
    if (quizType === 'text') {
      if (srsQuiz) {
        if (customOnly) {
          return customFlashcardsDueForReview ?? [];
        } else {
          return flashcardsDueForReview ?? [];
        }
      } else if (customOnly) {
        return customFlashcards ?? [];
      } else {
        return flashcards ?? [];
      }
    } else if (quizType === 'audio') {
      return audioFlashcards ?? [];
    }
    console.error('This should not happen');
    console.error('Invalid quiz type:', quizSettings.quizType);
    return [];
  }, [
    quizSettings.quizType,
    quizSettings.srsQuiz,
    quizSettings.customOnly,
    flashcards,
    flashcardsDueForReview,
    customFlashcards,
    customFlashcardsDueForReview,
    audioFlashcards,
  ]);

  // Determine current maximum allowed quiz length and enforce rules:
  // - Initialize quizLength to min(10, maximum) when it is 0 and there are cards
  // - If maximum shrinks below current quizLength, clamp to new maximum
  const maximumQuizLength = filteredFlashcards.length;

  const updateQuizSettings = useCallback(
    (key: keyof QuizSettings, value: QuizSettings[keyof QuizSettings]) => {
      setQuizSettings({ ...quizSettings, [key]: value });
    },
    [quizSettings],
  );
  const quizLength = useMemo(() => {
    const userSelectedQuizLength = quizSettings.userSelectedQuizLength;

    // No flashcards available
    if (maximumQuizLength === 0) {
      return 0;
    }

    const defaultQuizLength = Math.min(10, maximumQuizLength);

    // User hasn't selected a length yet - use default
    if (userSelectedQuizLength === 0) {
      return defaultQuizLength;
    }

    // User selection exceeds available cards - clamp to maximum
    if (userSelectedQuizLength > maximumQuizLength) {
      return maximumQuizLength;
    }

    // User selection equals maximum - use as-is
    if (userSelectedQuizLength === maximumQuizLength) {
      return userSelectedQuizLength;
    }

    // User selection is less than maximum - apply rounding rules
    const newValue = applyQuizLengthRoundingRules(
      userSelectedQuizLength,
      maximumQuizLength,
      defaultQuizLength,
    );
    return newValue;
  }, [quizSettings.userSelectedQuizLength, maximumQuizLength]);

  const setupQuiz = useCallback(() => {
    const quizType = quizSettings.quizType;
    const customOnly = quizSettings.customOnly;
    const srsQuiz = quizSettings.srsQuiz;
    if (!filteredFlashcards.length || quizLength === 0) {
      return null;
    }
    let randomizedFlashcards = [];

    if (quizType === 'text') {
      randomizedFlashcards = getRandomFlashcards({
        count: quizLength,
        customOnly,
        dueForReviewOnly: srsQuiz,
      });
      // } else if (quizType === 'audio') {
    } else {
      randomizedFlashcards = getRandomFlashcards({
        count: quizLength,
        audioOnly: true,
      });
    }
    // convert flashcards to ExampleWithVocabulary
    const examples = randomizedFlashcards.map((flashcard) => flashcard.example);
    setQuizReady(true);
    return examples;
  }, [
    getRandomFlashcards,
    filteredFlashcards,
    quizLength,
    quizSettings.quizType,
    quizSettings.customOnly,
    quizSettings.srsQuiz,
  ]);

  const quizSetupOptions = {
    availableFlashcards: filteredFlashcards,
    maximumQuizLength,
    hasCustomFlashcards: !!(customFlashcards && customFlashcards.length > 0),

    quizSettings,
    updateQuizSettings,

    setupQuiz,
  };

  // const reviewFlashcards = useMemo(() => {
  //   // NOTE: Running the isFlashcardCollected here will not work.
  //   // The selectedFlashcards here are a duplicate of the flashcards in the state.
  //   // So we need to check the flashcards in the state.
  //   return selectedFlashcards.filter((flashcard) =>
  //     flashcards?.some((f) => f.id === flashcard.id),
  //   );
  // }, [selectedFlashcards, flashcards]);

  // const reviewExamples: ExampleWithVocabulary[] = useMemo(() => {
  //   return reviewFlashcards.map((flashcard) => flashcard.example);
  // }, [reviewFlashcards]);

  // const reviewQuiz = useTextQuiz({
  //   examples: reviewExamples,
  //   canCollectFlashcards: true,
  //   startWithSpanish,
  // });

  return {
    myFlashcardsLoading: isLoading,
    myFlashcardsError: error,

    quizSetupOptions: {
      ...quizSetupOptions,
      quizSettings: {
        ...quizSetupOptions.quizSettings,
        userSelectedQuizLength: quizLength,
      },
    },

    quizReady,
    setQuizReady,

    setupQuiz,
  };
}
