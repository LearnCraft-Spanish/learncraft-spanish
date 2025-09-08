import type { AudioQuizProps } from '@application/units/useAudioQuiz';
import type { AudioQuizSetupReturn } from '@application/units/useAudioQuizSetup';
import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import type { TextQuizSetupReturn } from '@application/units/useTextQuizSetup';
import { useAudioQuizSetup } from '@application/units/useAudioQuizSetup';
import { useFilteredOwnedFlashcards } from '@application/units/useFilteredOwnedFlashcards';
import { useTextQuizSetup } from '@application/units/useTextQuizSetup';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import { useCallback, useMemo, useState } from 'react';

export enum MyFlashcardsQuizType {
  Text = 'text',
  Audio = 'audio',
}

export interface UseQuizMyFlashcardsReturn {
  audioQuizSetup: AudioQuizSetupReturn;
  textQuizSetup: TextQuizSetupReturn;

  textQuizProps: UseTextQuizProps;
  audioQuizProps: AudioQuizProps;

  filtersEnabled: boolean;
  setFiltersEnabled: (filtersEnabled: boolean) => void;
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

  // To get the filtered owned flashcards
  const {
    filteredFlashcards,
    setFiltersEnabled,
    filtersEnabled,
    isLoading: filteredFlashcardsLoading,
    error: filteredFlashcardsError,
  } = useFilteredOwnedFlashcards();

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
  const noFlashcards = !isLoading && !error && filteredExamples?.length === 0;

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
    setQuizReady(true);
  }, [quizNotReady, setQuizReady]);

  const cleanupQuiz = useCallback(() => {
    setQuizReady(false);
  }, [setQuizReady]);

  // Destructure for the text quiz props
  const {
    examplesToQuiz: textExamplesToQuizUnfiltered,
    startWithSpanish,
    quizLength: textQuizLength,
  } = textQuizSetup;

  // Filter and shuffle the text examples to quiz
  const textExamplesToQuiz = useMemo(() => {
    const shuffledExamples = fisherYatesShuffle(textExamplesToQuizUnfiltered);
    return shuffledExamples.slice(0, textQuizLength);
  }, [textExamplesToQuizUnfiltered, textQuizLength]);

  // Return the text quiz props
  const textQuizProps: UseTextQuizProps = {
    examples: textExamplesToQuiz,
    startWithSpanish,
    cleanupFunction: cleanupQuiz,
  };

  // Destructure for the audio quiz props
  const {
    audioQuizType,
    autoplay,
    selectedQuizLength: audioQuizLength,
  } = audioQuizSetup;

  // Slice and shuffle the audio examples to quiz
  const audioExamplesToQuiz = useMemo(() => {
    const shuffledExamples = fisherYatesShuffle(filteredAudioExamples);
    return shuffledExamples.slice(0, audioQuizLength);
  }, [filteredAudioExamples, audioQuizLength]);

  const audioQuizProps: AudioQuizProps = {
    examplesToQuiz: audioExamplesToQuiz,
    audioQuizType,
    autoplay,
    ready: quizReady,
    cleanupFunction: cleanupQuiz,
  };

  // Return the hooks, props, and local state
  return {
    // Quiz Setup Hooks
    audioQuizSetup,
    textQuizSetup,

    // Quiz Props
    textQuizProps,
    audioQuizProps,

    // Local states and methods for top level
    filtersEnabled,
    setFiltersEnabled,
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
