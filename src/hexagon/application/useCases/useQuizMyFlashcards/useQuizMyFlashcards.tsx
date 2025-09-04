import type { UseMyAudioQuizReturn } from './useMyAudioQuiz';
import type { UseMyTextQuizReturn } from './useMyTextQuiz';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useState } from 'react';
import { useMyAudioQuiz } from './useMyAudioQuiz';
import { useMyTextQuiz } from './useMyTextQuiz';

export enum MyFlashcardsQuizType {
  Text = 'text',
  Audio = 'audio',
}

export interface UseQuizMyFlashcardsReturn {
  audioQuizHook: UseMyAudioQuizReturn;
  textQuizHook: UseMyTextQuizReturn;
  quizType: MyFlashcardsQuizType;
  setQuizType: (quizType: MyFlashcardsQuizType) => void;
  quizReady: boolean;
  setQuizReady: (quizReady: boolean) => void;
  noFlashcards: boolean;
  isLoading: boolean;
  isError: boolean;
}

export function useQuizMyFlashcards(): UseQuizMyFlashcardsReturn {
  const [quizReady, setQuizReady] = useState(false);
  const [quizType, setQuizType] = useState<MyFlashcardsQuizType>(
    MyFlashcardsQuizType.Text,
  );

  // Prerequisite loading and error states
  const { isLoading: activeStudentIsLoading, error: activeStudentError } =
    useActiveStudent();
  const { isLoading: authLoading } = useAuthAdapter();
  const flashcardsHook = useStudentFlashcards();
  const { isLoading: flashcardsLoading, error: flashcardsError } =
    flashcardsHook;

  // Combine loading and error states
  const isLoading = authLoading || flashcardsLoading || activeStudentIsLoading;
  const isError = !!flashcardsError || !!activeStudentError;

  // Call the quiz hooks
  const audioQuizHook = useMyAudioQuiz();
  const textQuizHook = useMyTextQuiz();

  // To warn user if they try to quiz without flashcards
  const noFlashcards =
    !isLoading && !isError && flashcardsHook.flashcards?.length === 0;

  // Return the hooks and local state
  return {
    audioQuizHook,
    textQuizHook,
    quizType,
    setQuizType,
    quizReady,
    setQuizReady,
    noFlashcards,
    isLoading,
    isError,
  };
}
