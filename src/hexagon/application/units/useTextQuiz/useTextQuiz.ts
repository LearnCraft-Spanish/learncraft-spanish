import type { VocabInfo } from '@application/units/useVocabInfo';
import type { Answer, FlashcardForDisplay, Question } from '@domain/quizzing';
import type {
  ExampleWithVocabulary,
  Vocabulary,
} from '@learncraft-spanish/shared';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useVocabInfo } from '@application/units/useVocabInfo';
import { useCallback, useMemo, useState } from 'react';

export interface UseTextQuizProps {
  examples: ExampleWithVocabulary[] | null;
  examplesAreLoading?: boolean;
  startWithSpanish?: boolean;
  cleanupFunction: () => void;
}

export interface AddPendingRemoveProps {
  isAdding: boolean;
  isRemoving: boolean;
  isCollected: boolean;
  isCustom: boolean;
  addFlashcard: () => void;
  removeFlashcard: () => void;
}

export interface TextQuizReturn {
  examplesAreLoading?: boolean;
  addPendingRemoveProps: AddPendingRemoveProps | undefined;
  quizExample: FlashcardForDisplay | null;
  nextExample: () => void;
  previousExample: () => void;
  exampleNumber: number;
  quizLength: number;
  vocabInfoHook: (vocab: Vocabulary) => VocabInfo;
  currentExample: ExampleWithVocabulary | null;
  cleanupFunction: () => void;
  isQuizComplete: boolean;
  restartQuiz: () => void;

  answerShowing: boolean;
  toggleAnswer: () => void;

  getHelpIsOpen: boolean;
  setGetHelpIsOpen: (getHelpIsOpen: boolean) => void;
}

export function useTextQuiz({
  examples,
  examplesAreLoading = false,
  startWithSpanish = false,
  cleanupFunction,
}: UseTextQuizProps): TextQuizReturn {
  const { isStudent } = useAuthAdapter();

  const {
    isExampleCollected,
    createFlashcards,
    deleteFlashcards,
    isCustomFlashcard,
    isAddingFlashcard,
    isRemovingFlashcard,
  } = useStudentFlashcards();
  const vocabInfoHook = useVocabInfo;

  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const [getHelpIsOpen, setGetHelpIsOpen] = useState(false);

  const [answerShowing, setAnswerShowing] = useState(false);

  const hideAnswer = useCallback(() => {
    setAnswerShowing(false);
  }, []);

  const toggleAnswer = useCallback(() => {
    setAnswerShowing(!answerShowing);
  }, [answerShowing]);

  const safeExampleIndex = useMemo(() => {
    if (currentExampleIndex < 0) {
      return 0;
    }
    if (currentExampleIndex > (examples?.length || 0) - 1) {
      return (examples?.length || 0) - 1;
    }
    return currentExampleIndex;
  }, [currentExampleIndex, examples]);

  const nextExampleInternal = useCallback(() => {
    if (examples && safeExampleIndex < (examples?.length || 0) - 1) {
      setCurrentExampleIndex(safeExampleIndex + 1);
    } else if (examples && safeExampleIndex === (examples?.length || 0) - 1) {
      // We're at the last example and trying to go next, mark quiz as complete
      setIsQuizComplete(true);
    }
  }, [safeExampleIndex, examples]);

  // next example function for use in TextQuiz component
  const nextExample = useCallback(() => {
    nextExampleInternal();
    hideAnswer();
    setGetHelpIsOpen(false);
  }, [nextExampleInternal, hideAnswer]);

  const previousExampleInternal = useCallback(() => {
    if (safeExampleIndex > 0) {
      setCurrentExampleIndex(safeExampleIndex - 1);
    }
    // If we're going back from quiz complete state, reset it
    if (isQuizComplete) {
      setIsQuizComplete(false);
    }
  }, [safeExampleIndex, isQuizComplete]);

  // previous example function for use in TextQuiz component
  const previousExample = useCallback(() => {
    previousExampleInternal();
    hideAnswer();
    setGetHelpIsOpen(false);
  }, [previousExampleInternal, hideAnswer]);

  const restartQuiz = useCallback(() => {
    setCurrentExampleIndex(0);
    setIsQuizComplete(false);
  }, []);

  const currentExample: ExampleWithVocabulary | null = useMemo(() => {
    if (examples && examples.length > 0) {
      return examples[safeExampleIndex];
    }
    return null;
  }, [examples, safeExampleIndex]);

  const addFlashcard = useCallback(() => {
    if (!currentExample) {
      return;
    }
    if (isExampleCollected({ exampleId: currentExample.id })) {
      return;
    }
    createFlashcards([currentExample]);
  }, [currentExample, isExampleCollected, createFlashcards]);

  const removeFlashcard = useCallback(() => {
    if (!currentExample) {
      return;
    }
    if (!isExampleCollected({ exampleId: currentExample.id })) {
      return;
    }
    deleteFlashcards([currentExample.id]);
  }, [currentExample, isExampleCollected, deleteFlashcards]);

  const exampleNumber = safeExampleIndex + 1;
  const quizLength = examples?.length || 0;

  const question: Question | null = useMemo(() => {
    if (!currentExample) {
      return null;
    }
    return {
      spanish: startWithSpanish,
      text: startWithSpanish ? currentExample.spanish : currentExample.english,
      hasAudio: startWithSpanish
        ? !!currentExample.spanishAudio
        : !!currentExample.englishAudio,
      audioUrl: startWithSpanish
        ? currentExample.spanishAudio
        : currentExample.englishAudio,
    };
  }, [currentExample, startWithSpanish]);

  const answer: Answer | null = useMemo(() => {
    if (!currentExample) {
      return null;
    }
    return {
      spanish: !startWithSpanish,
      text: startWithSpanish ? currentExample.english : currentExample.spanish,
      hasAudio: startWithSpanish
        ? !!currentExample.englishAudio
        : !!currentExample.spanishAudio,
      audioUrl: startWithSpanish
        ? currentExample.englishAudio
        : currentExample.spanishAudio,
      owned: isExampleCollected({ exampleId: currentExample.id }),
      addFlashcard,
      removeFlashcard,
      updateFlashcardInterval: (
        exampleId: number,
        difficulty: 'easy' | 'hard',
      ) => {
        console.error(
          `not implemented yet. exampleId: ${exampleId} called with new difficulty: ${difficulty}`,
        );
      },
      vocabulary: currentExample.vocabulary,
      vocabComplete: currentExample.vocabularyComplete,
    };
  }, [
    currentExample,
    startWithSpanish,
    addFlashcard,
    removeFlashcard,
    isExampleCollected,
  ]);

  const quizExample: FlashcardForDisplay | null = useMemo(() => {
    if (!question || !answer || !currentExample) {
      return null;
    }
    return {
      question,
      answer,
      exampleIsCollected: isExampleCollected({ exampleId: currentExample.id }),
      exampleIsCustom: isCustomFlashcard({ exampleId: currentExample.id }),
      exampleIsAdding: isAddingFlashcard({ exampleId: currentExample.id }),
      exampleIsRemoving: isRemovingFlashcard({ exampleId: currentExample.id }),
    };
  }, [
    question,
    answer,
    isExampleCollected,
    isCustomFlashcard,
    isAddingFlashcard,
    isRemovingFlashcard,
    currentExample,
  ]);

  return {
    examplesAreLoading,
    addPendingRemoveProps: isStudent
      ? {
          isAdding: isAddingFlashcard({ exampleId: currentExample?.id ?? 0 }),
          isRemoving: isRemovingFlashcard({
            exampleId: currentExample?.id ?? 0,
          }),
          isCollected: isExampleCollected({
            exampleId: currentExample?.id ?? 0,
          }),
          isCustom: isCustomFlashcard({ exampleId: currentExample?.id ?? 0 }),
          addFlashcard,
          removeFlashcard,
        }
      : undefined,

    quizExample,
    exampleNumber,
    quizLength,
    nextExample,
    previousExample,
    vocabInfoHook,

    currentExample,
    cleanupFunction,
    isQuizComplete,
    restartQuiz,

    answerShowing,
    toggleAnswer,

    getHelpIsOpen,
    setGetHelpIsOpen,
  };
}
