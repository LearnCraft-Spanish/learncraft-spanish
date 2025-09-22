import type { AudioQuizProps } from '@application/units/useAudioQuiz';
import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import { useMemo, useRef, useState } from 'react';
import { fisherYatesShuffle } from 'src/hexagon/domain/functions/fisherYatesShuffle';
import { useExampleQuery } from '../queries/useExampleQuery';
import { useAudioQuizSetup } from '../units/useAudioQuizSetup';
import { useTextQuizSetup } from '../units/useTextQuizSetup';

export enum CombinedCustomQuizType {
  Text = 'text',
  Audio = 'audio',
}

export interface UseCombinedCustomQuizReturn {
  // Quiz type selection
  quizType: CombinedCustomQuizType;
  setQuizType: (type: CombinedCustomQuizType) => void;

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

  // Text quiz setup
  textQuizSetup: ReturnType<typeof useTextQuizSetup>;

  // Audio quiz setup
  audioQuizSetup: ReturnType<typeof useAudioQuizSetup>;

  // Quiz props
  textQuizProps: UseTextQuizProps;
  audioQuizProps: AudioQuizProps;
}

export function useCombinedCustomQuiz(): UseCombinedCustomQuizReturn {
  const QUERY_PAGE_SIZE = 150;

  // Local state
  const [quizType, setQuizType] = useState<CombinedCustomQuizType>(
    CombinedCustomQuizType.Text,
  );
  const [quizReady, setQuizReady] = useState(false);

  // Track if we've ever loaded data successfully
  const hasLoadedDataBefore = useRef(false);

  // Static snapshots of examples taken when quiz starts
  const staticTextExamples = useRef<any[]>([]);
  const staticAudioExamples = useRef<any[]>([]);

  // Get examples data - only require audio when quiz type is Audio
  // For text quiz, let user choose via the audio-only checkbox
  const audioRequired = quizType === CombinedCustomQuizType.Audio;
  const {
    isDependenciesLoading,
    filteredExamples: exampleQuery,
    isLoading: isLoadingExamples,
    totalCount,
    error: errorExamples,
    updatePageSize,
  } = useExampleQuery(QUERY_PAGE_SIZE, audioRequired);

  // Update the ref when we successfully get data
  if (totalCount !== null && !hasLoadedDataBefore.current) {
    hasLoadedDataBefore.current = true;
  }

  // Determine if this is initial loading (never loaded before) vs filter changes (have loaded before)
  const isInitialLoading = useMemo(() => {
    return (
      isDependenciesLoading ||
      (isLoadingExamples && !hasLoadedDataBefore.current)
    );
  }, [isLoadingExamples, isDependenciesLoading]);

  // Filter examples that have audio for audio quiz
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

  // Text quiz setup hook
  const textQuizSetup = useTextQuizSetup({
    examples: exampleQuery || [],
    ownedOnly: false,
  });

  // Quiz readiness checks
  const quizNotReady = useMemo(() => {
    if (quizType === CombinedCustomQuizType.Text) {
      return textQuizSetup.quizLength === 0 || isLoadingExamples;
    } else {
      return audioQuizSetup.selectedQuizLength === 0 || isLoadingExamples;
    }
  }, [
    quizType,
    textQuizSetup.quizLength,
    audioQuizSetup.selectedQuizLength,
    isLoadingExamples,
  ]);

  // Function to ready the quiz
  const readyQuiz = () => {
    if (quizType === CombinedCustomQuizType.Text) {
      // Take snapshot of text examples
      const shuffledExamples = fisherYatesShuffle(textQuizSetup.examplesToQuiz);
      staticTextExamples.current = shuffledExamples.slice(
        0,
        textQuizSetup.quizLength,
      );
      // Update page size if needed
      if (textQuizSetup.quizLength > QUERY_PAGE_SIZE) {
        updatePageSize(textQuizSetup.quizLength);
      }
    } else {
      // Take snapshot of audio examples
      const shuffledAudioExamples = fisherYatesShuffle(safeAudioExamples);
      staticAudioExamples.current = shuffledAudioExamples.slice(
        0,
        audioQuizSetup.selectedQuizLength,
      );
    }
    setQuizReady(true);
  };

  // Cleanup function
  const cleanupQuiz = () => {
    staticTextExamples.current = [];
    staticAudioExamples.current = [];
    setQuizReady(false);
  };

  // Text quiz props
  const textQuizProps: UseTextQuizProps = {
    examples: quizReady ? staticTextExamples.current : [],
    startWithSpanish: textQuizSetup.startWithSpanish,
    cleanupFunction: cleanupQuiz,
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
    quizType,
    setQuizType,
    quizReady,
    setQuizReady,
    quizNotReady,
    readyQuiz,
    isLoadingExamples,
    isInitialLoading,
    totalCount,
    errorExamples,
    textQuizSetup,
    audioQuizSetup,
    textQuizProps,
    audioQuizProps,
  };
}
