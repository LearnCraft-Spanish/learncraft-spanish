import type {
  AudioQuizProps,
  AudioQuizReturn,
} from '@application/units/useAudioQuiz';
import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';
import { useExampleQuery } from '@application/queries/useExampleQuery';
import { useAudioQuiz } from '@application/units/useAudioQuiz';
import { useAudioQuizSetup } from '@application/units/useAudioQuizSetup';
import { useExampleFilter } from '@application/units/useExampleFilter';
import { useMemo, useState } from 'react';
import { fisherYatesShuffle } from 'src/hexagon/domain/functions/fisherYatesShuffle';

export interface UseCustomAudioQuizReturnType {
  audioQuiz: AudioQuizReturn;
  exampleFilter: UseExampleFilterReturnType;
  quizReady: boolean;
  setQuizReady: (quizReady: boolean) => void;
}

export function useCustomAudioQuiz(): UseCustomAudioQuizReturnType {
  const [quizReady, setQuizReady] = useState(false);
  const exampleFilter = useExampleFilter();
  const { filteredExamples: exampleQuery } = useExampleQuery(150, true);
  const filteredExamples = useMemo(() => exampleQuery ?? [], [exampleQuery]);
  const audioQuizSetup = useAudioQuizSetup(filteredExamples);

  // Take a shuffled slice of the examples to quiz
  const slicedExamplesToQuiz = useMemo(() => {
    const shuffledExamples = fisherYatesShuffle(filteredExamples);
    return shuffledExamples.slice(0, audioQuizSetup.selectedQuizLength);
  }, [filteredExamples, audioQuizSetup.selectedQuizLength]);

  // Return the audio quiz props
  const audioQuizProps: AudioQuizProps = {
    examplesToQuiz: slicedExamplesToQuiz,
    audioQuizType: audioQuizSetup.audioQuizType,
    autoplay: audioQuizSetup.autoplay,
    ready: quizReady,
    cleanupFunction: () => setQuizReady(false),
  };
  const audioQuiz = useAudioQuiz(audioQuizProps);
  return { audioQuiz, exampleFilter, quizReady, setQuizReady };
}
