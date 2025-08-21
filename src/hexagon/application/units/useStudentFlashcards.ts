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
  customFlashcards: Flashcard[] | undefined;
  customFlashcardsDueForReview: Flashcard[] | undefined;
  getRandomFlashcards: (count: number) => Flashcard[];
  getRandomCustomFlashcards: (count: number) => Flashcard[];
  getRandomFlashcardsDueForReview: (count: number) => Flashcard[];
  getRandomCustomFlashcardsDueForReview: (count: number) => Flashcard[];
  isFlashcardCollected: (flashcardId: number) => boolean;
  isExampleCollected: (exampleId: number) => boolean;
  isCustomFlashcard: (exampleId: number) => boolean;
  isPendingFlashcard: (exampleId: number) => boolean;
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

  const isCustomFlashcard = useCallback(
    (exampleId: number) => {
      return (
        flashcards?.some(
          (flashcard) => flashcard.example.id === exampleId && flashcard.custom,
        ) ?? false
      );
    },
    [flashcards],
  );

  const isPendingFlashcard = useCallback(
    (exampleId: number) => {
      return (
        flashcards?.some(
          (flashcard) => flashcard.example.id === exampleId && flashcard.id < 0,
        ) ?? false
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

  const customFlashcards = useMemo(() => {
    return flashcards?.filter((flashcard) => flashcard.custom);
  }, [flashcards]);

  const flashcardsDueForReview = useMemo(() => {
    return flashcards?.filter(
      (flashcard) => new Date(flashcard.nextReview) <= new Date(),
    );
  }, [flashcards]);

  const customFlashcardsDueForReview = useMemo(() => {
    return customFlashcards?.filter(
      (flashcard) => new Date(flashcard.nextReview) <= new Date(),
    );
  }, [customFlashcards]);

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

  const getRandomCustomFlashcards = useCallback(
    (count: number) => {
      if (!customFlashcards) return [];
      return fisherYatesShuffle(customFlashcards).slice(0, count);
    },
    [customFlashcards],
  );

  const getRandomFlashcardsDueForReview = useCallback(
    (count: number) => {
      if (!flashcardsDueForReview) return [];
      return fisherYatesShuffle(flashcardsDueForReview).slice(0, count);
    },
    [flashcardsDueForReview],
  );

  const getRandomCustomFlashcardsDueForReview = useCallback(
    (count: number) => {
      if (!customFlashcardsDueForReview) return [];
      return fisherYatesShuffle(customFlashcardsDueForReview).slice(0, count);
    },
    [customFlashcardsDueForReview],
  );

  return {
    flashcards,
    customFlashcards,
    flashcardsDueForReview,
    customFlashcardsDueForReview,
    getRandomFlashcards,
    getRandomCustomFlashcards,
    getRandomFlashcardsDueForReview,
    getRandomCustomFlashcardsDueForReview,
    collectedExamples,
    isLoading,
    error,
    isExampleCollected,
    isFlashcardCollected,
    createFlashcards,
    deleteFlashcards,
    isCustomFlashcard,
    isPendingFlashcard,
  };
};
