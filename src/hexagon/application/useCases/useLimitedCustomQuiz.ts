import type { AudioQuizProps } from '@application/units/useAudioQuiz';
import { useMemo, useRef, useState } from 'react';
import { fisherYatesShuffle } from 'src/hexagon/domain/functions/fisherYatesShuffle';
import { useExampleQuery } from '../queries/useExampleQuery';
import { useAudioQuizSetup } from '../units/useAudioQuizSetup';

export interface UseLimitedCustomQuizReturn {
  // Quiz readiness
  quizReady: boolean;
  setQuizReady: (ready: boolean) => void;
  quizNotReady: boolean;
  readyQuiz: () => void;

  // Data loading
  isLoadingExamples: boolean;
  isInitialLoading: boolean;
  totalCount: number | null;
  errorExamples: Error | null;

  // Audio quiz setup (only option for limited users)
  audioQuizSetup: ReturnType<typeof useAudioQuizSetup>;

  // Quiz props
  audioQuizProps: AudioQuizProps;
}

export function useLimitedCustomQuiz(): UseLimitedCustomQuizReturn {
  const QUERY_PAGE_SIZE = 150;

  // Local state
  const [quizReady, setQuizReady] = useState(false);

  // Track if we've ever loaded data successfully
  const hasLoadedDataBefore = useRef(false);

  // Static snapshots of examples taken when quiz starts
  const staticAudioExamples = useRef<any[]>([]);

  // Get examples data (audio only for limited users)
  const {
    filteredExamples: exampleQuery,
    isLoading: isLoadingExamples,
    totalCount,
    error: errorExamples,
  } = useExampleQuery(QUERY_PAGE_SIZE, true); // true = audioRequired

  // Update the ref when we successfully get data
  if (totalCount !== null && !hasLoadedDataBefore.current) {
    hasLoadedDataBefore.current = true;
  }

  // Determine if this is initial loading (never loaded before) vs filter changes (have loaded before)
  const isInitialLoading = useMemo(() => {
    return isLoadingExamples && !hasLoadedDataBefore.current;
  }, [isLoadingExamples]);

  // Filter examples that have audio (should be all of them since audioRequired=true)
  const safeAudioExamples = useMemo(() => {
    if (!exampleQuery) {
      return [];
    }
    return exampleQuery.filter((example) => {
      return example.spanishAudio?.length > 0;
    });
  }, [exampleQuery]);

  // Audio quiz setup hook
  const audioQuizSetup = useAudioQuizSetup(safeAudioExamples);

  // Quiz readiness checks
  const quizNotReady = useMemo(() => {
    return audioQuizSetup.selectedQuizLength === 0 || isLoadingExamples;
  }, [audioQuizSetup.selectedQuizLength, isLoadingExamples]);

  // Function to ready the quiz
  const readyQuiz = () => {
    // Take snapshot of audio examples
    const shuffledAudioExamples = fisherYatesShuffle(safeAudioExamples);
    staticAudioExamples.current = shuffledAudioExamples.slice(
      0,
      audioQuizSetup.selectedQuizLength,
    );
    setQuizReady(true);
  };

  // Cleanup function
  const cleanupQuiz = () => {
    staticAudioExamples.current = [];
    setQuizReady(false);
  };

  // Audio quiz props
  const audioQuizProps: AudioQuizProps = {
    examplesToQuiz: quizReady ? staticAudioExamples.current : [],
    audioQuizType: audioQuizSetup.audioQuizType,
    autoplay: audioQuizSetup.autoplay,
    ready: quizReady,
    cleanupFunction: cleanupQuiz,
  };

  return {
    quizReady,
    setQuizReady,
    quizNotReady,
    readyQuiz,
    isLoadingExamples,
    isInitialLoading,
    totalCount,
    errorExamples,
    audioQuizSetup,
    audioQuizProps,
  };
}
