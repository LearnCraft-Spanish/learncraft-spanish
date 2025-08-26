import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface QuizSettings {
  // Universal Quiz Settings
  quizType: 'text' | 'audio';
  quizLength: number;

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
    quizLength: 0,
    startWithSpanish: false,
    srsQuiz: true,
    customOnly: false,
    audioQuizVariant: 'speaking',
    autoplay: true,
  });

  const updateQuizSettings = useCallback(
    (key: keyof QuizSettings, value: QuizSettings[keyof QuizSettings]) => {
      setQuizSettings({ ...quizSettings, [key]: value });
    },
    [quizSettings],
  );

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
    if (quizSettings.quizType === 'text') {
      if (quizSettings.srsQuiz) {
        if (quizSettings.customOnly) {
          return customFlashcardsDueForReview ?? [];
        } else {
          return flashcardsDueForReview ?? [];
        }
      } else if (quizSettings.customOnly) {
        return customFlashcards ?? [];
      } else {
        return flashcards ?? [];
      }
    } else if (quizSettings.quizType === 'audio') {
      return audioFlashcards ?? [];
    }
    console.error('This should not happen');
    console.error('Invalid quiz type:', quizSettings.quizType);
    return [];
  }, [
    quizSettings,
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

  useEffect(() => {
    setQuizSettings((previousSettings) => {
      if (maximumQuizLength === 0) {
        return previousSettings.quizLength === 0
          ? previousSettings
          : { ...previousSettings, quizLength: 0 };
      }

      const desiredDefault = Math.min(10, maximumQuizLength);
      console.log('maximumQuizLength', maximumQuizLength);
      console.log('previousSettings.quizLength', previousSettings.quizLength);
      console.log('desiredDefault', desiredDefault);
      if (previousSettings.quizLength === 0) {
        return { ...previousSettings, quizLength: desiredDefault };
      }

      if (previousSettings.quizLength > maximumQuizLength) {
        return { ...previousSettings, quizLength: maximumQuizLength };
      }

      if (previousSettings.quizLength < maximumQuizLength) {
        console.log('rounding to nearest 10: ', desiredDefault);
        const roundedQuizLength =
          Math.round(previousSettings.quizLength / 10) * 10;
        // round to nearest 10
        return {
          ...previousSettings,
          quizLength:
            roundedQuizLength < maximumQuizLength && roundedQuizLength !== 0
              ? roundedQuizLength
              : desiredDefault,
        };
      }

      return previousSettings;
    });
  }, [maximumQuizLength]);
  /*
  const maximumQuizLength = useMemo(() => {
    if (quizSettings.quizType === 'text') {
      if (quizSettings.customOnly) {
        if (quizSettings.srsQuiz) {
          return customFlashcardsDueForReview?.length ?? 0;
        } else {
          return customFlashcards?.length ?? 0;
        }
      } else {
        if (quizSettings.srsQuiz) {
          return flashcardsDueForReview?.length ?? 0;
        } else {
          return flashcards?.length ?? 0;
        }
      }
    } else {
      return audioFlashcards?.length ?? 0;
    }
  }, [
    quizSettings,
    flashcards,
    flashcardsDueForReview,
    audioFlashcards,
    customFlashcards,
    customFlashcardsDueForReview,
  ]);
  */

  const setupQuiz = useCallback(() => {
    if (!filteredFlashcards.length || quizSettings.quizLength === 0) {
      return null;
    }
    let randomizedFlashcards = [];

    if (quizSettings.quizType === 'text') {
      randomizedFlashcards = getRandomFlashcards({
        count: quizSettings.quizLength,
        customOnly: quizSettings.customOnly,
        dueForReviewOnly: quizSettings.srsQuiz,
      });
      // } else if (quizType === 'audio') {
    } else {
      randomizedFlashcards = getRandomFlashcards({
        count: quizSettings.quizLength,
        audioOnly: true,
      });
    }
    // convert flashcards to ExampleWithVocabulary
    const examples = randomizedFlashcards.map((flashcard) => flashcard.example);
    setQuizReady(true);
    return examples;
  }, [quizSettings, getRandomFlashcards, filteredFlashcards]);

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

    quizSetupOptions,

    quizReady,
    setQuizReady,

    setupQuiz,
  };
}
