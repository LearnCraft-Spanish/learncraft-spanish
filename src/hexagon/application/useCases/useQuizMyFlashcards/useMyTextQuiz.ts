import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type {
  TextQuizProps,
  TextQuizReturn,
} from '@application/units/useTextQuiz';
import type {
  TextQuizSetupProps,
  TextQuizSetupReturn,
} from '@application/units/useTextQuizSetup';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useTextQuiz } from '@application/units/useTextQuiz';
import { useTextQuizSetup } from '@application/units/useTextQuizSetup';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import { useMemo, useState } from 'react';

export interface UseMyTextQuizReturn {
  textQuizSetup: TextQuizSetupReturn;
  examples: ExampleWithVocabulary[];
  textQuiz: TextQuizReturn;
  flashcardsHook: UseStudentFlashcardsReturn;
  srsQuiz: boolean;
  startWithSpanish: boolean;
  customOnly: boolean;
  canCollectFlashcards: boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useMyTextQuiz = (): UseMyTextQuizReturn => {
  // Needed to determine if we can collect flashcards
  const {
    isStudent,
    isAdmin,
    isCoach,
    isLoading: authLoading,
  } = useAuthAdapter();

  // To get the flashcards
  const flashcardsHook = useStudentFlashcards();

  const {
    flashcards,
    flashcardsDueForReview,
    customFlashcards,
    customFlashcardsDueForReview,
    isLoading: flashcardsLoading,
    error,
  } = flashcardsHook;

  // Determine if we are loading
  const isLoading = authLoading || flashcardsLoading;

  // Local states with boolean choices
  const [srsQuiz, setSrsQuiz] = useState<boolean>(true);
  const [startWithSpanish, setStartWithSpanish] = useState<boolean>(false);
  const [customOnly, setCustomOnly] = useState<boolean>(false);

  // Determine if we can collect flashcards
  const canCollectFlashcards = isStudent || isAdmin || isCoach;

  // Find flashcards from chosen criteria
  const chosenFlashcards = useMemo(() => {
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
  }, [
    flashcards,
    flashcardsDueForReview,
    customFlashcards,
    customFlashcardsDueForReview,
    srsQuiz,
    customOnly,
  ]);

  // Find examples from chosen flashcards
  const chosenExamples = useMemo(() => {
    return chosenFlashcards.map((flashcard) => flashcard.example);
  }, [chosenFlashcards]);

  // Composition of text quiz props to pass to useTextQuizSetup
  const textQuizSetupProps: TextQuizSetupProps = {
    examples: chosenExamples,
    srsQuiz,
    setSrsQuiz,
    startWithSpanish,
    setStartWithSpanish,
    customOnly,
    setCustomOnly,
  };

  // Call the text quiz setup hook
  const textQuizSetup = useTextQuizSetup(textQuizSetupProps);

  // Access the traits we need for our internal parsing
  const quizLength = textQuizSetup.selectedQuizLength;

  // Shuffle the owned examples and take a slice of the correct size
  const examplesToQuiz: ExampleWithVocabulary[] = useMemo(() => {
    const shuffledExamples = fisherYatesShuffle(chosenExamples ?? []);
    return shuffledExamples.slice(0, quizLength);
  }, [chosenExamples, quizLength]);

  // Composition of text quiz props to pass to useTextQuiz
  const textQuizProps: TextQuizProps = {
    examples: examplesToQuiz,
    startWithSpanish,
  };

  // Call the text quiz hook
  const textQuiz = useTextQuiz(textQuizProps);

  // Return the setup hook return, the audio quiz return, and our loading/error states
  return {
    textQuizSetup, // Hook that handles all UI for text quiz setup
    textQuiz, // Hook that handles all UI for text quiz
    examples: chosenExamples,
    srsQuiz,
    startWithSpanish,
    customOnly,
    canCollectFlashcards, // UI needs to know whether to display the collect flashcards button
    flashcardsHook, // Needed for the actual adding and removing of flashcards
    isLoading,
    error,
  };
};
