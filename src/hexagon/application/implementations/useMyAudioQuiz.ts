import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useAudioQuiz } from '@application/units/useAudioQuiz';
import { useAudioQuizSetup } from '@application/units/useAudioQuizSetup';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import { useMemo } from 'react';

export const useMyAudioQuiz = () => {
  const { collectedExamples, isLoading, error } = useStudentFlashcards();

  // Call setup hook to return
  const audioQuizSetup = useAudioQuizSetup(collectedExamples ?? []);

  // Access the traits we need for our internal parsing
  const quizLength = audioQuizSetup.selectedQuizLength;
  const audioQuizType = audioQuizSetup.audioQuizType;
  const autoplay = audioQuizSetup.autoplay;

  // Shuffle the owned examples and take a slice of the correct size
  const examplesToQuiz: ExampleWithVocabulary[] = useMemo(() => {
    const shuffledExamples = fisherYatesShuffle(collectedExamples ?? []);
    return shuffledExamples.slice(0, quizLength);
  }, [collectedExamples, quizLength]);

  // Composition of audio quiz props to pass to useAudioQuiz
  const audioQuizProps = {
    examplesToQuiz,
    audioQuizType,
    autoplay,
  };

  // Call the audio quiz hook
  const audioQuiz = useAudioQuiz(audioQuizProps);

  // Return the setup hook return, the audio quiz return, and our loading/error states
  return { audioQuizSetup, audioQuiz, isLoading, error };
};
