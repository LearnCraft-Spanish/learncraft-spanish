import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import { useMemo, useRef, useState } from 'react';
import { fisherYatesShuffle } from 'src/hexagon/domain/functions/fisherYatesShuffle';
import { useAuthAdapter } from '../adapters/authAdapter';
import { useActiveStudent } from '../coordinators/hooks/useActiveStudent';
import { useStudentFlashcards } from './useStudentFlashcards';

export interface TextQuizSetupReturn {
  availableQuizLengths: number[];
  quizLength: number;
  setSelectedQuizLength: (selectedQuizLength: number) => void;
  canAccessSRS: boolean;
  srsQuiz: boolean;
  setSrsQuiz: (srsQuiz: boolean) => void;
  startWithSpanish: boolean;
  setStartWithSpanish: (startWithSpanish: boolean) => void;
  canAccessCustom: boolean;
  customOnly: boolean;
  setCustomOnly: (customOnly: boolean) => void;
  examplesToQuiz: ExampleWithVocabulary[];
  isLoading: boolean;
  error: Error | null;
}

export interface UseTextQuizSetupProps {
  examples: ExampleWithVocabulary[];
  ownedOnly: boolean;
}

export function useTextQuizSetup({
  examples,
  ownedOnly,
}: UseTextQuizSetupProps): TextQuizSetupReturn {
  // Required hooks to determine accessibility of SRS and Custom quizzes
  const { isAdmin, isCoach } = useAuthAdapter();
  const {
    appUser,
    isOwnUser,
    isLoading: activeStudentLoading,
    error: activeStudentError,
  } = useActiveStudent();
  const {
    flashcards,
    flashcardsDueForReview,
    customFlashcards,
    customFlashcardsDueForReview,
    isLoading: flashcardsLoading,
    error: flashcardsError,
  } = useStudentFlashcards();

  // Combine loading and error states
  const isLoading = activeStudentLoading || flashcardsLoading;
  const error = activeStudentError || flashcardsError;

  // Determine if we can access SRS and Custom quizzes
  // Student can access their own custom flashcards, coaches/admins can access any.
  const canAccessCustom =
    ownedOnly &&
    appUser?.studentRole === 'student' &&
    (isAdmin || isCoach || isOwnUser) &&
    (customFlashcards?.length ?? 0) > 0;

  // SRS quizzes are only accessible to the students themselves
  const canAccessSRS =
    ownedOnly && isOwnUser && appUser?.studentRole === 'student';

  // Local states with boolean choices
  const [srsQuiz, setSrsQuiz] = useState<boolean>(true);
  const [startWithSpanish, setStartWithSpanish] = useState<boolean>(false);
  const [customOnly, setCustomOnly] = useState<boolean>(false);

  // Find owned flashcards with the chosen criteria
  const allowedFlashcards: Flashcard[] | null = useMemo(() => {
    if (srsQuiz && canAccessSRS) {
      if (customOnly && canAccessCustom) {
        return customFlashcardsDueForReview ?? [];
      } else {
        return flashcardsDueForReview ?? [];
      }
    } else if (customOnly && canAccessCustom) {
      return customFlashcards ?? [];
    } else if (ownedOnly) {
      return flashcards ?? [];
    }
    return null;
  }, [
    flashcards,
    flashcardsDueForReview,
    customFlashcards,
    customFlashcardsDueForReview,
    srsQuiz,
    canAccessSRS,
    canAccessCustom,
    customOnly,
    ownedOnly,
  ]);

  // Find examples from owned flashcards with the chosen criteria
  const chosenExamples = useMemo(() => {
    // If no restrictions, use the examples passed in
    if (allowedFlashcards === null) {
      return examples;
    }
    // Otherwise, use the allowed flashcards
    const allowedExamples = allowedFlashcards.map(
      (flashcard) => flashcard.example,
    );
    return allowedExamples;
  }, [allowedFlashcards, examples]);

  // Filter the examples to only include the chosen examples
  const filteredExamples = useMemo(() => {
    const filtered = examples.filter((example) => {
      const id = example.id;
      return chosenExamples.some((chosenExample) => chosenExample.id === id);
    });
    return filtered;
  }, [examples, chosenExamples]);

  // Arbitrary definitions for permissible quiz lengths
  const quizLengthOptions = useRef<number[]>([10, 20, 50, 100]);

  // Which quiz lengths are usable for the number of examples we have
  const availableQuizLengths: number[] = useMemo(() => {
    // Empty array if examples still loading
    if (!filteredExamples) return [];
    // Remove lengths longer than the available set
    const filteredOptions = quizLengthOptions.current.filter(
      (number: number) => number <= filteredExamples.length,
    );
    // Add precise total if not included and not equal to an existing option
    if (!filteredOptions.includes(filteredExamples.length)) {
      if (filteredExamples.length < 100) {
        // Add length if under 100
        filteredOptions.push(filteredExamples.length);
      } else {
        // Add total count if over 100
        filteredOptions.push(filteredExamples.length);
      }
    }
    // Return parsed options
    // sort by size, smallest to largest
    return filteredOptions.sort((a, b) => a - b);
  }, [filteredExamples, quizLengthOptions]);

  // Local state for choice of quiz length
  const [selectedQuizLength, setSelectedQuizLength] = useState<number>(0);

  // Keep the selected quiz length within the available options
  const safeQuizLength: number = useMemo(() => {
    if (availableQuizLengths.length === 0) {
      // If no options are available, return 0
      return 0;
    } else if (selectedQuizLength < availableQuizLengths[0]) {
      // If the quiz length is invalid/unspecified, default to 20 if available
      // Otherwise, use the largest available option that's <= 20, or the smallest option
      const defaultOption = availableQuizLengths.includes(20)
        ? 20
        : availableQuizLengths.find((option) => option <= 20) ||
          availableQuizLengths[0];
      return defaultOption;
    }
    // If the quiz length is valid, find all smaller options
    const acceptableOptions: number[] = [];
    for (const option of availableQuizLengths) {
      if (option <= selectedQuizLength) {
        acceptableOptions.push(option);
      }
    }
    // If there are acceptable options, return the largest one
    return acceptableOptions[acceptableOptions.length - 1] || 0;
  }, [selectedQuizLength, availableQuizLengths]);

  // Shuffle the owned examples and take a slice of the correct size
  const examplesToQuiz: ExampleWithVocabulary[] = useMemo(() => {
    const shuffledExamples = fisherYatesShuffle(filteredExamples ?? []);
    return shuffledExamples.slice(0, safeQuizLength);
  }, [filteredExamples, safeQuizLength]);

  // Return bundled options
  return {
    examplesToQuiz,
    quizLength: safeQuizLength,
    canAccessSRS, // DO NOT render SRS controls if false
    srsQuiz,
    setSrsQuiz,
    startWithSpanish,
    setStartWithSpanish,
    canAccessCustom, // DO NOT render Custom controls if false
    customOnly,
    setCustomOnly,
    availableQuizLengths,
    setSelectedQuizLength,
    isLoading,
    error,
  };
}
