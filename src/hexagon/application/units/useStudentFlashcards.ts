import type {
  ExampleWithVocabulary,
  Flashcard,
  UpdateFlashcardIntervalCommand,
} from '@learncraft-spanish/shared';
import type { SrsDifficulty } from 'src/hexagon/domain/srs';
import { useFlashcardsQuery } from '@application/queries/useFlashcardsQuery';
import { useCallback, useMemo } from 'react';
import { fisherYatesShuffle } from 'src/functions/fisherYatesShuffle';
import {
  calculateNewSrsInterval,
  getCurrentInterval,
} from 'src/hexagon/domain/srs';

export interface UseStudentFlashcardsReturnType {
  flashcards: Flashcard[] | undefined;
  flashcardsDueForReview: Flashcard[] | undefined;
  customFlashcards: Flashcard[] | undefined;
  customFlashcardsDueForReview: Flashcard[] | undefined;
  audioFlashcards: Flashcard[] | undefined;
  collectedExamples: ExampleWithVocabulary[] | undefined;
  getRandomFlashcards: ({
    count,
    customOnly,
    dueForReviewOnly,
    audioOnly,
  }: {
    count: number;
    customOnly?: boolean;
    dueForReviewOnly?: boolean;
    audioOnly?: boolean;
  }) => Flashcard[];
  isFlashcardCollected: (flashcardId: number) => boolean;
  isExampleCollected: (exampleId: number) => boolean;
  isCustomFlashcard: (exampleId: number) => boolean;
  isPendingFlashcard: (exampleId: number) => boolean;
  isLoading: boolean;
  error: Error | null;
  createFlashcards: (exampleIds: number[]) => Promise<Flashcard[]>;
  deleteFlashcards: (exampleIds: number[]) => Promise<number>;
  updateFlashcards: (
    updates: UpdateFlashcardIntervalCommand[],
  ) => Promise<Flashcard[]>;
  updateFlashcardInterval: (
    exampleId: number,
    difficulty: SrsDifficulty,
  ) => Promise<number>;
}

export const useStudentFlashcards = (): UseStudentFlashcardsReturnType => {
  const {
    flashcards,
    isLoading,
    error,
    createFlashcards,
    deleteFlashcards,
    updateFlashcards,
  } = useFlashcardsQuery();

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

  /*
  I dont love this method of isPending. Its how we did it in the old version by
  adding the flashcard with a negative id, but I dont think optomistic updates are the right choice for this. It also 
  doesnt work with pending removals. I think we could utalize the way bulk Add/Remove works, by putting a state
  in useStudentFlashcardsthat holds all pending options with the exampleId & weather the operation is an add or remove.
  We use that to track pending & if its an add or remove pending, then based on result from backend we can either make
  the successful updates to the query, or give explicit error messages about what flashcard failed
  (ex: failed to add flashcard with english text: "hello")
  */

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
      (flashcard) =>
        new Date(flashcard.nextReview) <= new Date() || !flashcard.nextReview,
    );
  }, [flashcards]);

  const customFlashcardsDueForReview = useMemo(() => {
    return customFlashcards?.filter(
      (flashcard) =>
        new Date(flashcard.nextReview) <= new Date() || !flashcard.nextReview,
    );
  }, [customFlashcards]);

  const collectedExamples = useMemo(() => {
    return flashcards?.map((flashcard) => flashcard.example);
  }, [flashcards]);

  const audioFlashcards = useMemo(() => {
    return flashcards?.filter((flashcard) => flashcard.example.spanishAudio);
  }, [flashcards]);

  const getRandomFlashcards = useCallback(
    ({
      count,
      customOnly = false,
      dueForReviewOnly = false,
      audioOnly = false,
    }: {
      count: number;
      customOnly?: boolean;
      dueForReviewOnly?: boolean;
      audioOnly?: boolean;
    }) => {
      if (audioOnly) {
        // audio only COULD also do srs, but it should not ever be CUSTOM ONLY + AUDIO ONLY
        return fisherYatesShuffle(audioFlashcards ?? []).slice(0, count);
      }
      if (customOnly) {
        if (dueForReviewOnly) {
          return fisherYatesShuffle(customFlashcardsDueForReview ?? []).slice(
            0,
            count,
          );
        } else {
          return fisherYatesShuffle(customFlashcards ?? []).slice(0, count);
        }
      } else {
        if (dueForReviewOnly) {
          return fisherYatesShuffle(flashcardsDueForReview ?? []).slice(
            0,
            count,
          );
        } else {
          return fisherYatesShuffle(flashcards ?? []).slice(0, count);
        }
      }
    },
    [
      flashcards,
      customFlashcards,
      flashcardsDueForReview,
      customFlashcardsDueForReview,
      audioFlashcards,
    ],
  );

  const updateFlashcardInterval = useCallback(
    async (exampleId: number, difficulty: SrsDifficulty): Promise<number> => {
      // Find the flashcard by example ID
      const flashcard = flashcards?.find(
        (flashcard) => flashcard.example.id === exampleId,
      );

      if (!flashcard) {
        throw new Error(`Flashcard not found for example ID: ${exampleId}`);
      }

      // Calculate the new interval using domain logic
      const currentInterval = getCurrentInterval(flashcard);
      const newInterval = calculateNewSrsInterval(currentInterval, difficulty);

      // Update the flashcard with the new interval
      await updateFlashcards([
        { flashcardId: flashcard.id, interval: newInterval },
      ]);

      return newInterval;
    },
    [flashcards, updateFlashcards],
  );

  return {
    flashcards,
    customFlashcards,
    flashcardsDueForReview,
    customFlashcardsDueForReview,
    audioFlashcards,
    getRandomFlashcards,
    collectedExamples,
    isLoading,
    error,
    isExampleCollected,
    isFlashcardCollected,
    createFlashcards,
    deleteFlashcards,
    updateFlashcards,
    updateFlashcardInterval,
    isCustomFlashcard,
    isPendingFlashcard,
  };
};
