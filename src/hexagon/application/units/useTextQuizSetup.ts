import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
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
    (isAdmin || isCoach || isOwnUser);

  // SRS quizzes are only accessible to the students themselves
  const canAccessSRS =
    ownedOnly && isOwnUser && appUser?.studentRole === 'student';

  // Arbitrary definitions for permissible quiz lengths
  const quizLengthOptions = useRef<number[]>([10, 20, 50, 75, 100, 150]);

  // Local states with boolean choices
  const [srsQuiz, setSrsQuiz] = useState<boolean>(canAccessSRS);
  const [startWithSpanish, setStartWithSpanish] = useState<boolean>(false);
  const [customOnly, setCustomOnly] = useState<boolean>(canAccessCustom);

  // Which quiz lengths are usable for the number of examples we have
  const availableQuizLengths: number[] = useMemo(() => {
    // Empty array if examples still loading
    if (!examples) return [];
    // Remove lengths longer than the available set
    const filteredOptions = quizLengthOptions.current.filter(
      (number: number) => number <= examples.length,
    );
    // Add precise total if not included and under 150
    if (examples.length < 150 && !filteredOptions.includes(examples.length)) {
      filteredOptions.push(examples.length);
    }
    // Return parsed options
    return filteredOptions.sort();
  }, [examples, quizLengthOptions]);

  // Local state for choice of quiz length
  const [selectedQuizLength, setSelectedQuizLength] = useState<number>(0);

  // Keep the selected quiz length within the available options
  const safeQuizLength: number = useMemo(() => {
    const acceptableOptions: number[] = [];
    // Find all options that are less than or equal to the selected quiz length
    for (const option of availableQuizLengths) {
      if (option <= selectedQuizLength) {
        acceptableOptions.push(option);
      }
    }
    // If there are acceptable options, return the largest one
    if (acceptableOptions.length > 0) {
      return acceptableOptions[acceptableOptions.length - 1];
    }
    // Otherwise, return 0
    return 0;
  }, [selectedQuizLength, availableQuizLengths]);

  // Find owned flashcards with the chosen criteria
  const allowedFlashcards = useMemo(() => {
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

  // Find examples from owned flashcards with the chosen criteria
  const chosenExamples = useMemo(() => {
    const examples = allowedFlashcards.map((flashcard) => flashcard.example);
    return examples;
  }, [allowedFlashcards]);

  // Filter the examples to only include the chosen examples
  const filteredExamples = useMemo(() => {
    return examples.filter((example) => chosenExamples.includes(example));
  }, [examples, chosenExamples]);

  // Shuffle the owned examples and take a slice of the correct size
  const examplesToQuiz: ExampleWithVocabulary[] = useMemo(() => {
    const shuffledExamples = fisherYatesShuffle(filteredExamples ?? []);
    return shuffledExamples.slice(0, selectedQuizLength);
  }, [filteredExamples, selectedQuizLength]);

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
