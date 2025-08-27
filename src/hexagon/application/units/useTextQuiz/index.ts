import type { VocabInfo } from '@application/units/useVocabInfo';
import type { Answer, FlashcardForDisplay, Question } from '@domain/quizzing';
import type {
  ExampleWithVocabulary,
  Vocabulary,
} from '@learncraft-spanish/shared';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useVocabInfo } from '@application/units/useVocabInfo';
import { useState } from 'react';

export interface TextQuizProps {
  examples: ExampleWithVocabulary[];
  startWithSpanish: boolean;
  canCollectFlashcards: boolean;
}

export interface TextQuizReturn {
  addFlashcard: () => void;
  removeFlashcard: () => void;
  updateFlashcard: (exampleId: string) => void;
  canCollectFlashcards: boolean;
  quizExample: FlashcardForDisplay;
  nextExample: () => void;
  previousExample: () => void;
  exampleNumber: number;
  quizLength: number;
  vocabInfoHook: (vocab: Vocabulary) => VocabInfo;
}

export const useTextQuiz = ({
  examples,
  canCollectFlashcards,
  startWithSpanish = false,
}: TextQuizProps): TextQuizReturn => {
  const {
    isExampleCollected,
    createFlashcards,
    deleteFlashcards,
    isCustomFlashcard,
    isPendingFlashcard,
  } = useStudentFlashcards();
  const vocabInfoHook = useVocabInfo;

  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const nextExample = () => {
    if (currentExampleIndex < examples.length - 1) {
      setCurrentExampleIndex(currentExampleIndex + 1);
    }
  };

  const previousExample = () => {
    if (currentExampleIndex > 0) {
      setCurrentExampleIndex(currentExampleIndex - 1);
    }
  };

  const currentExample: ExampleWithVocabulary = examples[currentExampleIndex];

  const addFlashcard = () => {
    if (isExampleCollected(currentExample.id)) {
      return;
    }
    createFlashcards([currentExample.id]);
  };

  const removeFlashcard = () => {
    if (!isExampleCollected(currentExample.id)) {
      return;
    }
    deleteFlashcards([currentExample.id]);
  };

  const exampleNumber = currentExampleIndex + 1;
  const quizLength = examples.length;

  const question: Question = {
    spanish: startWithSpanish,
    text: currentExample.spanish,
    hasAudio: !!currentExample.spanishAudio,
    audioUrl: currentExample.spanishAudio,
  };

  const answer: Answer = {
    spanish: !startWithSpanish,
    text: currentExample.english,
    hasAudio: !!currentExample.englishAudio,
    audioUrl: currentExample.englishAudio,
    owned: isExampleCollected(currentExample.id),
    addFlashcard,
    removeFlashcard,
    vocabulary: currentExample.vocabulary,
    vocabComplete: currentExample.vocabularyComplete,
  };

  const quizExample: FlashcardForDisplay = {
    question,
    answer,
    exampleIsCollected: isExampleCollected(currentExample.id),
    exampleIsCustom: isCustomFlashcard(currentExample.id),
    exampleIsPending: isPendingFlashcard(currentExample.id),
  };

  return {
    addFlashcard,
    removeFlashcard,
    updateFlashcard: () => {
      console.error(
        'not implemented yet. called with current example id:',
        currentExample.id,
      );
    },
    canCollectFlashcards,
    quizExample,
    exampleNumber,
    quizLength,
    nextExample,
    previousExample,
    vocabInfoHook,
  };
};
