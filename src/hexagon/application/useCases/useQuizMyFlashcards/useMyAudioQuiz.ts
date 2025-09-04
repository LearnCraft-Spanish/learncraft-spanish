import type { AudioQuizReturn } from '@application/units/useAudioQuiz';
import type { AudioQuizSetupReturn } from '@application/units/useAudioQuizSetup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import type { AudioQuizType } from 'src/hexagon/domain/audioQuizzing';
import { useAudioQuiz } from '@application/units/useAudioQuiz';
import { useAudioQuizSetup } from '@application/units/useAudioQuizSetup';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import { useMemo } from 'react';

export interface UseMyAudioQuizReturn {
  audioQuizSetup: AudioQuizSetupReturn;
  audioQuiz: AudioQuizReturn;
  flashcardsHook: UseStudentFlashcardsReturn;
  quizLength: number;
  audioQuizType: AudioQuizType;
  autoplay: boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useMyAudioQuiz = (): UseMyAudioQuizReturn => {
  // To get the flashcards
  const flashcardsHook = useStudentFlashcards();

  // Destructuring only the traits we need here
  const { audioFlashcards, isLoading, error } = flashcardsHook;

  // Get the examples from the flashcards
  const collectedAudioExamples = audioFlashcards?.map(
    (flashcard) => flashcard.example,
  );

  // Call setup hook to return
  const audioQuizSetup = useAudioQuizSetup(collectedAudioExamples ?? []);

  // Access the traits we need for our internal parsing
  const quizLength = audioQuizSetup.selectedQuizLength;
  const audioQuizType = audioQuizSetup.audioQuizType;
  const autoplay = audioQuizSetup.autoplay;

  // Shuffle the owned examples and take a slice of the correct size
  const examplesToQuiz: ExampleWithVocabulary[] = useMemo(() => {
    const shuffledExamples = fisherYatesShuffle(collectedAudioExamples ?? []);
    return shuffledExamples.slice(0, quizLength);
  }, [collectedAudioExamples, quizLength]);

  // Composition of audio quiz props to pass to useAudioQuiz
  const audioQuizProps = {
    examplesToQuiz,
    audioQuizType,
    autoplay,
  };

  // Call the audio quiz hook
  const audioQuiz = useAudioQuiz(audioQuizProps);

  // Return the setup hook return, the audio quiz return, and our loading/error states
  return {
    audioQuizSetup, // Hook that handles all UI for audio quiz setup
    audioQuiz, // Hook that handles all UI for audio quiz
    flashcardsHook, // Needed for the actual adding and removing of flashcards
    quizLength,
    audioQuizType,
    autoplay,
    isLoading, // Needed for the loading state
    error, // Needed for the error state
  };
};
