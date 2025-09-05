import type { VocabInfo } from '@application/units/useVocabInfo';
import type { Answer, FlashcardForDisplay, Question } from '@domain/quizzing';
import type {
  ExampleWithVocabulary,
  Vocabulary,
} from '@learncraft-spanish/shared';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useVocabInfo } from '@application/units/useVocabInfo';
import { useCallback, useMemo, useState } from 'react';

export interface TextQuizProps {
  examples: ExampleWithVocabulary[];
  startWithSpanish: boolean;
  canCollectFlashcards: boolean;
}

export interface TextQuizReturn {
  addFlashcard: () => void;
  removeFlashcard: () => void;
  canCollectFlashcards: boolean;
  quizExample: FlashcardForDisplay | null;
  nextExample: () => void;
  previousExample: () => void;
  exampleNumber: number;
  quizLength: number;
  vocabInfoHook: (vocab: Vocabulary) => VocabInfo;
  currentExample: ExampleWithVocabulary | null;
}

export function useTextQuiz({
  examples,
  canCollectFlashcards,
  startWithSpanish = false,
}: TextQuizProps): TextQuizReturn {
  const {
    isExampleCollected,
    createFlashcards,
    deleteFlashcards,
    isCustomFlashcard,
    isPendingFlashcard,
  } = useStudentFlashcards();
  const vocabInfoHook = useVocabInfo;

  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const nextExample = useCallback(() => {
    if (currentExampleIndex < examples.length - 1) {
      setCurrentExampleIndex(currentExampleIndex + 1);
    }
  }, [currentExampleIndex, examples.length]);

  const previousExample = useCallback(() => {
    if (currentExampleIndex > 0) {
      setCurrentExampleIndex(currentExampleIndex - 1);
    }
  }, [currentExampleIndex]);

  const currentExample: ExampleWithVocabulary | null = useMemo(() => {
    if (examples.length > 0) {
      return examples[currentExampleIndex];
    }
    return null;
  }, [examples, currentExampleIndex]);

  const addFlashcard = useCallback(() => {
    if (!currentExample) {
      return;
    }
    if (isExampleCollected(currentExample.id)) {
      return;
    }
    createFlashcards([currentExample.id]);
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

  const exampleNumber = currentExampleIndex + 1;
  const quizLength = examples.length;

  const question: Question | null = useMemo(() => {
    if (!currentExample) {
      return null;
    }
    return {
      spanish: startWithSpanish,
      text: currentExample.spanish,
      hasAudio: !!currentExample.spanishAudio,
      audioUrl: currentExample.spanishAudio,
    };
  }, [currentExample, startWithSpanish]);

  const answer: Answer | null = useMemo(() => {
    if (!currentExample) {
      return null;
    }
    return {
      spanish: !startWithSpanish,
      text: currentExample.english,
      hasAudio: !!currentExample.englishAudio,
      audioUrl: currentExample.englishAudio,
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
      exampleIsPending: isPendingFlashcard(currentExample.id),
    };
  }, [
    question,
    answer,
    isExampleCollected,
    isCustomFlashcard,
    isPendingFlashcard,
    currentExample,
  ]);

  return {
    addFlashcard,
    removeFlashcard,
    canCollectFlashcards,
    quizExample,
    exampleNumber,
    quizLength,
    nextExample,
    previousExample,
    vocabInfoHook,

    currentExample,
  };
}
