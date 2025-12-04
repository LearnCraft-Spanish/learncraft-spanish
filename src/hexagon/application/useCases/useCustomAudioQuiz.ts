import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { AudioQuizProps } from '@application/units/useAudioQuiz';
import type { AudioQuizSetupReturn } from '@application/units/useAudioQuizSetup';
import { useExampleQuery } from '@application/queries/ExampleQueries/useExampleQuery';
import useQueryPagination from '@application/units/Pagination/useQueryPagination';
import { useAudioQuizSetup } from '@application/units/useAudioQuizSetup';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import { useMemo, useState } from 'react';

export interface UseCustomAudioQuizReturnType {
  isDependenciesLoading: boolean;
  pagination: QueryPaginationState;
  audioQuizSetup: AudioQuizSetupReturn;
  audioQuizProps: AudioQuizProps;
  quizReady: boolean;
  totalCount: number | null;
  setQuizReady: (quizReady: boolean) => void;
  isLoadingExamples: boolean;
  errorExamples: Error | null;
}

export function useCustomAudioQuiz(): UseCustomAudioQuizReturnType {
  const QUERY_PAGE_SIZE = 150;
  const PAGE_SIZE = 25;
  const [quizReady, setQuizReady] = useState(false);

  const {
    isDependenciesLoading,
    filteredExamples: exampleQuery,
    isLoading: isLoadingExamples,
    page,
    changeQueryPage,
    totalCount,
    error: errorExamples,
  } = useExampleQuery(QUERY_PAGE_SIZE, true);

  const pagination: QueryPaginationState = useQueryPagination({
    queryPage: page,
    pageSize: PAGE_SIZE,
    queryPageSize: QUERY_PAGE_SIZE,
    totalCount: totalCount ?? undefined,
    changeQueryPage,
  });

  const safeExamples = useMemo(() => {
    if (!exampleQuery) {
      return [];
    }
    return exampleQuery.filter((example) => {
      return example.spanishAudio?.length > 0;
    });
  }, [exampleQuery]);

  const audioQuizSetup = useAudioQuizSetup(safeExamples);

  // Take a shuffled slice of the examples to quiz
  const slicedExamplesToQuiz = useMemo(() => {
    const shuffledExamples = fisherYatesShuffle(safeExamples);
    return shuffledExamples.slice(0, audioQuizSetup.selectedQuizLength);
  }, [safeExamples, audioQuizSetup.selectedQuizLength]);

  // Return the audio quiz props
  const audioQuizProps: AudioQuizProps = {
    examplesToQuiz: slicedExamplesToQuiz,
    audioQuizType: audioQuizSetup.audioQuizType,
    autoplay: audioQuizSetup.autoplay,
    ready: quizReady,
    cleanupFunction: () => setQuizReady(false),
  };

  return {
    isDependenciesLoading,
    pagination,
    audioQuizSetup,
    audioQuizProps,
    quizReady,
    totalCount,
    setQuizReady,
    isLoadingExamples,
    errorExamples,
  };
}
