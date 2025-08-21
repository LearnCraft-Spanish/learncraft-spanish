import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import { useFlashcardsQuery } from '@application/queries/useFlashcardsQuery';
import { useCallback, useMemo } from 'react';
import { fisherYatesShuffle } from 'src/functions/fisherYatesShuffle';

export interface UseStudentFlashcardsReturnType {
  flashcards: Flashcard[] | undefined;
  flashcardsDueForReview: Flashcard[] | undefined;
  getRandomFlashcards: (count: number) => Flashcard[];
  getRandomFlashcardsDueForReview: (count: number) => Flashcard[];
  isFlashcardCollected: (flashcardId: number) => boolean;
  isExampleCollected: (exampleId: number) => boolean;
  collectedExamples: ExampleWithVocabulary[] | undefined;
  isLoading: boolean;
  error: Error | null;
  createFlashcards: (exampleIds: number[]) => Promise<Flashcard[]>;
  deleteFlashcards: (exampleIds: number[]) => Promise<number>;
}

export const useStudentFlashcards = (): UseStudentFlashcardsReturnType => {
  const { flashcards, isLoading, error, createFlashcards, deleteFlashcards } =
    useFlashcardsQuery();

  const isExampleCollected = useCallback(
    (exampleId: number) => {
      return (
        flashcards?.some((flashcard) => flashcard.example.id === exampleId) ??
        false
      );
    },
    [flashcards],
  );

  const isFlashcardCollected = useCallback(
    (flashcardId: number) => {
      return (
        flashcards?.some((flashcard) => flashcard.id === flashcardId) ?? false
      );
    },
    [flashcards],
  );

  const flashcardsDueForReview = useMemo(() => {
    return flashcards?.filter(
      (flashcard) => new Date(flashcard.nextReview) <= new Date(),
    );
  }, [flashcards]);

  const collectedExamples = useMemo(() => {
    return flashcards?.map((flashcard) => flashcard.example);
  }, [flashcards]);

  const getRandomFlashcards = useCallback(
    (count: number) => {
      if (!flashcards) return [];
      return fisherYatesShuffle(flashcards).slice(0, count);
    },
    [flashcards],
  );

  const getRandomFlashcardsDueForReview = useCallback(
    (count: number) => {
      if (!flashcardsDueForReview) return [];
      return fisherYatesShuffle(flashcardsDueForReview).slice(0, count);
    },
    [flashcardsDueForReview],
  );

  return {
    flashcards,
    flashcardsDueForReview,
    getRandomFlashcards,
    getRandomFlashcardsDueForReview,
    collectedExamples,
    isLoading,
    error,
    isExampleCollected,
    isFlashcardCollected,
    createFlashcards,
    deleteFlashcards,
  };
};
