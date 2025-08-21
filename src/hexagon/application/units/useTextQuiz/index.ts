import type { VocabInfo } from '@application/units/useVocabInfo';
import type { Answer, FlashcardDisplay, Question } from '@domain/quizzing';
import type {
  ExampleWithVocabulary,
  Vocabulary,
} from '@learncraft-spanish/shared';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useVocabInfo } from '@application/units/useVocabInfo';
import { useState } from 'react';

interface TextQuizProps {
  examples: ExampleWithVocabulary[];
  startWithSpanish: boolean;
  canCollectFlashcards: boolean;
}

interface TextQuizReturn {
  canCollectFlashcards: boolean;
  quizExample: FlashcardDisplay;
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
  const { isFlashcardCollected, createFlashcards, deleteFlashcards } =
    useStudentFlashcards();
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

  const addFlashcard = (flashcardId: number) => {
    if (isFlashcardCollected(flashcardId)) {
      return;
    }
    createFlashcards([flashcardId]);
  };

  const removeFlashcard = (flashcardId: number) => {
    if (!isFlashcardCollected(flashcardId)) {
      return;
    }
    deleteFlashcards([flashcardId]);
  };

  const currentExample: ExampleWithVocabulary = examples[currentExampleIndex];

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
    owned: isFlashcardCollected(currentExample.id),
    addFlashcard,
    removeFlashcard,
    vocabulary: currentExample.vocabulary,
    vocabComplete: currentExample.vocabularyComplete,
  };

  const quizExample: FlashcardDisplay = {
    question,
    answer,
  };

  return {
    canCollectFlashcards,
    quizExample,
    exampleNumber,
    quizLength,
    nextExample,
    previousExample,
    vocabInfoHook,
  };
};
