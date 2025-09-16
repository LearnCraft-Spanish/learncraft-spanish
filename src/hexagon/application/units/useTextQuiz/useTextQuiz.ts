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
    isFlashcardCollected,
  } = useStudentFlashcards();
  const vocabInfoHook = useVocabInfo;

  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const safeExampleIndex = useMemo(() => {
    if (currentExampleIndex < 0) {
      return 0;
    }
    if (currentExampleIndex > (examples?.length || 0) - 1) {
      return (examples?.length || 0) - 1;
    }
    return currentExampleIndex;
  }, [currentExampleIndex, examples]);

  const nextExample = useCallback(() => {
    if (examples && safeExampleIndex < (examples?.length || 0) - 1) {
      setCurrentExampleIndex(safeExampleIndex + 1);
    }
  }, [safeExampleIndex, examples]);

  const previousExample = useCallback(() => {
    if (safeExampleIndex > 0) {
      setCurrentExampleIndex(safeExampleIndex - 1);
    }
  }, [safeExampleIndex]);

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
    if (isExampleCollected(currentExample.id)) {
      return;
    }
    createFlashcards([currentExample]);
  }, [currentExample, isExampleCollected, createFlashcards]);

  const removeFlashcard = useCallback(() => {
    if (!currentExample) {
      return;
    }
    if (!isExampleCollected(currentExample.id)) {
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
      owned: isExampleCollected(currentExample.id),
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
      exampleIsCollected: isExampleCollected(currentExample.id),
      exampleIsCustom: isCustomFlashcard(currentExample.id),
      exampleIsAdding: isAddingFlashcard(currentExample.id),
      exampleIsRemoving: isRemovingFlashcard(currentExample.id),
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
          isAdding: isAddingFlashcard(currentExample?.id ?? 0),
          isRemoving: isRemovingFlashcard(currentExample?.id ?? 0),
          isCollected: isFlashcardCollected(currentExample?.id ?? 0),
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
  };
}
