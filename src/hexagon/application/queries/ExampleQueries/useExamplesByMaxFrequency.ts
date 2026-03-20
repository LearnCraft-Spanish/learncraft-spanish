import type { SpanglishFilter } from '@application/types/exampleSearch';
import type { ExampleMaxFrequency } from '@learncraft-spanish/shared';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export interface UseExamplesByMaxFrequencyParams {
  highestFirst: boolean;
  vocabularyComplete?: boolean;
  spanglish?: SpanglishFilter;
}

export interface UseExamplesByMaxFrequencyReturnType {
  examples: ExampleMaxFrequency[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useExamplesByMaxFrequency({
  highestFirst,
  vocabularyComplete,
  spanglish = 'all',
}: UseExamplesByMaxFrequencyParams): UseExamplesByMaxFrequencyReturnType {
  const { searchExamplesByMaxFrequency } = useExampleAdapter();

  const {
    data: examples,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'examples',
      'by max frequency',
      highestFirst,
      vocabularyComplete,
      spanglish,
    ],
    queryFn: () =>
      searchExamplesByMaxFrequency({
        highestFirst,
        vocabularyComplete,
        spanglish,
      }),
    ...queryDefaults.referenceData,
  });

  return {
    examples,
    isLoading,
    error: error ?? null,
  };
}
