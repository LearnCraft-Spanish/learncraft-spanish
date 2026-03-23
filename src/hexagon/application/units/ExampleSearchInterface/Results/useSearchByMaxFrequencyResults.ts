import type { SpanglishFilter } from '@application/types/exampleSearch';
import type { PaginationState } from '@application/units/Pagination/usePagination';
import type { ExampleMaxFrequency } from '@learncraft-spanish/shared';
import { useExamplesByMaxFrequency } from '@application/queries/ExampleQueries/useExamplesByMaxFrequency';
import { usePagination } from '@application/units/Pagination/usePagination';
import { useMemo } from 'react';

const PAGE_SIZE = 25;

export interface UseSearchByMaxFrequencyResultsParams {
  highestFirst: boolean;
  spanglish: SpanglishFilter;
  vocabularyComplete?: boolean;
}

export interface UseSearchByMaxFrequencyResultsReturnType {
  examples: ExampleMaxFrequency[] | undefined;
  isLoading: boolean;
  error: Error | null;
  paginationState: PaginationState;
}

export function useSearchByMaxFrequencyResults({
  highestFirst,
  spanglish,
  vocabularyComplete,
}: UseSearchByMaxFrequencyResultsParams): UseSearchByMaxFrequencyResultsReturnType {
  const { examples, isLoading, error } = useExamplesByMaxFrequency({
    highestFirst,
    spanglish,
    vocabularyComplete,
  });

  const paginationState = usePagination({
    itemsPerPage: PAGE_SIZE,
    totalItems: examples?.length ?? 0,
  });

  const paginatedExamples = useMemo(() => {
    if (!examples) return undefined;
    return examples.slice(paginationState.startIndex, paginationState.endIndex);
  }, [examples, paginationState.startIndex, paginationState.endIndex]);

  return {
    examples: paginatedExamples,
    isLoading,
    error: error ?? null,
    paginationState,
  };
}
