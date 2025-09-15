import type { AudioQuizProps } from '@application/units/useAudioQuiz';
import type { AudioQuizSetupReturn } from '@application/units/useAudioQuizSetup';
import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import type { TextQuizSetupReturn } from '@application/units/useTextQuizSetup';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import type { UseCombinedFiltersWithVocabularyReturnType } from '../../units/Filtering/useCombinedFiltersWithVocabulary';
import type { UseSkillTagSearchReturnType } from '../../units/useSkillTagSearch';
import { useAudioQuizSetup } from '@application/units/useAudioQuizSetup';
import { useFilteredOwnedFlashcards } from '@application/units/useFilteredOwnedFlashcards';
import { useTextQuizSetup } from '@application/units/useTextQuizSetup';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCombinedFiltersWithVocabulary } from '../../units/Filtering/useCombinedFiltersWithVocabulary';
import { useSkillTagSearch } from '../../units/useSkillTagSearch';

export enum MyFlashcardsQuizType {
  Text = 'text',
  Audio = 'audio',
}

export interface UseQuizMyFlashcardsReturn {
  audioQuizSetup: AudioQuizSetupReturn;
  textQuizSetup: TextQuizSetupReturn;

  exampleFilter: UseCombinedFiltersWithVocabularyReturnType;
  skillTagSearch: UseSkillTagSearchReturnType;
  textQuizProps: UseTextQuizProps;
  audioQuizProps: AudioQuizProps;

  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;
  quizType: MyFlashcardsQuizType;
  setQuizType: (quizType: MyFlashcardsQuizType) => void;
  quizReady: boolean;
  quizNotReady: boolean;
  readyQuiz: () => void;
  cleanupQuiz: () => void;
  noFlashcards: boolean;

  isLoading: boolean;
  error: Error | null;
}

export function useQuizMyFlashcards(): UseQuizMyFlashcardsReturn {
  // Local state for the quiz ready state
  const [quizReady, setQuizReady] = useState(false);
  // Local state for the quiz type
  const [quizType, setQuizType] = useState<MyFlashcardsQuizType>(
    MyFlashcardsQuizType.Text,
  );

  // Static snapshots of examples taken when quiz starts to prevent live updates from affecting active quiz
  const staticTextExamples = useRef<ExampleWithVocabulary[]>([]);
  const staticAudioExamples = useRef<ExampleWithVocabulary[]>([]);

  // To get the filtered owned flashcards
  const {
    filteredFlashcards,
    setFilterOwnedFlashcards,
    filterOwnedFlashcards,
    isLoading: filteredFlashcardsLoading,
    error: filteredFlashcardsError,
  } = useFilteredOwnedFlashcards();

  const exampleFilter: UseCombinedFiltersWithVocabularyReturnType =
    useCombinedFiltersWithVocabulary();

  // Get the examples from the flashcards
  const filteredExamples = useMemo(
    () => filteredFlashcards?.map((flashcard) => flashcard.example) ?? [],
    [filteredFlashcards],
  );

  // Filtered for audio also
  const filteredAudioFlashcards = useMemo(
    () =>
      filteredFlashcards?.filter(
        (flashcard) => flashcard.example.spanishAudio?.length > 0,
      ),
    [filteredFlashcards],
  );

  // Get the examples from the flashcards
  const filteredAudioExamples = useMemo(
    () => filteredAudioFlashcards?.map((flashcard) => flashcard.example) ?? [],
    [filteredAudioFlashcards],
  );

  // Call the audio quiz setup hook
  const audioQuizSetup = useAudioQuizSetup(filteredAudioExamples);

  // call the text quiz setup hook
  const textQuizSetup = useTextQuizSetup({
    examples: filteredExamples ?? [],
    ownedOnly: true,
  });

  // Destructuring only the traits we need here
  const { isLoading: textQuizLoading, error: textQuizError } = textQuizSetup;

  // Combine the loading and error states (audio would be redundant, purely derived)
  const isLoading = filteredFlashcardsLoading || textQuizLoading;
  const error = filteredFlashcardsError || textQuizError;

  // To warn user if they try to quiz without flashcards
  const noFlashcards =
    !isLoading &&
    !error &&
    !filterOwnedFlashcards &&
    filteredExamples?.length === 0;

  // Quiz Not Ready
  const quizNotReady = useMemo(() => {
    if (quizType === MyFlashcardsQuizType.Text) {
      return !textQuizSetup.examplesToQuiz.length;
    } else if (quizType === MyFlashcardsQuizType.Audio) {
      return !audioQuizSetup.totalExamples;
    }
    return false;
  }, [
    quizType,
    textQuizSetup.examplesToQuiz.length,
    audioQuizSetup.totalExamples,
  ]);

  const readyQuiz = useCallback(() => {
    if (quizNotReady) {
      return;
    }

    // Take static snapshots of current examples when quiz starts
    if (quizType === MyFlashcardsQuizType.Text) {
      const shuffledExamples = fisherYatesShuffle([
        ...textQuizSetup.examplesToQuiz,
      ]);
      staticTextExamples.current = shuffledExamples.slice(
        0,
        textQuizSetup.quizLength,
      );
    } else if (quizType === MyFlashcardsQuizType.Audio) {
      const shuffledExamples = fisherYatesShuffle([...filteredAudioExamples]);
      staticAudioExamples.current = shuffledExamples.slice(
        0,
        audioQuizSetup.selectedQuizLength,
      );
    }

    setQuizReady(true);
  }, [
    quizNotReady,
    setQuizReady,
    quizType,
    textQuizSetup.examplesToQuiz,
    textQuizSetup.quizLength,
    filteredAudioExamples,
    audioQuizSetup.selectedQuizLength,
  ]);

  const cleanupQuiz = useCallback(() => {
    // Clear static snapshots when quiz ends
    staticTextExamples.current = [];
    staticAudioExamples.current = [];
    setQuizReady(false);
  }, [setQuizReady]);

  // Destructure for the text quiz props
  const { startWithSpanish } = textQuizSetup;

  // Use static examples when quiz is ready, otherwise use live data for setup
  const textExamplesToQuiz = useMemo(() => {
    if (quizReady) {
      return staticTextExamples.current;
    }
    // During setup, still use live data for quiz length calculations
    return [];
  }, [quizReady]);

  // Return the text quiz props
  const textQuizProps: UseTextQuizProps = {
    examples: textExamplesToQuiz,
    startWithSpanish,
    cleanupFunction: cleanupQuiz,
  };

  // Destructure for the audio quiz props
  const { audioQuizType, autoplay } = audioQuizSetup;

  // Use static examples when quiz is ready, otherwise use live data for setup
  const audioExamplesToQuiz = useMemo(() => {
    if (quizReady) {
      return staticAudioExamples.current;
    }
    // During setup, still use live data for quiz length calculations
    return [];
  }, [quizReady]);

  const audioQuizProps: AudioQuizProps = {
    examplesToQuiz: audioExamplesToQuiz,
    audioQuizType,
    autoplay,
    ready: quizReady,
    cleanupFunction: cleanupQuiz,
  };

  const skillTagSearch: UseSkillTagSearchReturnType = useSkillTagSearch();

  // Always reset to false on exit
  useEffect(() => {
    return () => {
      setFilterOwnedFlashcards(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Return the hooks, props, and local state
  return {
    // Quiz Setup Hooks
    audioQuizSetup,
    textQuizSetup,
    exampleFilter,
    skillTagSearch,
    // Quiz Props
    textQuizProps,
    audioQuizProps,

    // Local states and methods for top level
    filterOwnedFlashcards,
    setFilterOwnedFlashcards,
    quizType,
    setQuizType,
    quizReady,
    quizNotReady,
    readyQuiz,
    cleanupQuiz,
    noFlashcards,

    // Loading and error states
    isLoading,
    error,
  };
}
