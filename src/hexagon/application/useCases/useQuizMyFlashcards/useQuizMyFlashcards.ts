import type { AudioQuizProps } from '@application/units/useAudioQuiz';
import type { AudioQuizSetupReturn } from '@application/units/useAudioQuizSetup';
import type { TextQuizProps } from '@application/units/useTextQuiz';
import type { TextQuizSetupReturn } from '@application/units/useTextQuizSetup';
import { useAudioQuizSetup } from '@application/units/useAudioQuizSetup';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
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

  textQuizProps: TextQuizProps;
  audioQuizProps: AudioQuizProps;

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

  // To get the flashcards
  const {
    collectedExamples,
    audioFlashcards,
    isLoading: flashcardsLoading,
    error: flashcardsError,
  } = useStudentFlashcards();

  // Get the examples from the flashcards
  const collectedAudioExamples = useMemo(
    () => audioFlashcards?.map((flashcard) => flashcard.example) ?? [],
    [audioFlashcards],
  );

  // Call the audio quiz setup hook
  const audioQuizSetup = useAudioQuizSetup(collectedAudioExamples);

  // call the text quiz setup hook
  const textQuizSetup = useTextQuizSetup({
    examples: collectedExamples ?? [],
    ownedOnly: true,
  });

  // Destructuring only the traits we need here
  const { isLoading: textQuizLoading, error: textQuizError } = textQuizSetup;

  // Combine the loading and error states (audio would be redundant, purely derived)
  const isLoading = flashcardsLoading || textQuizLoading;
  const error = flashcardsError || textQuizError;

  // To warn user if they try to quiz without flashcards
  const noFlashcards = !isLoading && !error && collectedExamples?.length === 0;

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
  const textQuizProps: TextQuizProps = {
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

  // Filter and shuffle the audio examples to quiz
  const audioExamplesToQuiz = useMemo(() => {
    const shuffledExamples = fisherYatesShuffle(collectedAudioExamples);
    return shuffledExamples.slice(0, audioQuizLength);
  }, [collectedAudioExamples, audioQuizLength]);

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
