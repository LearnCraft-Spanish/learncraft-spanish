import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { useQuery } from '@tanstack/react-query';

export interface UseSearchByTextResultsParams {
  spanishString: string;
  englishString: string;
}

export function useSearchByTextResults({
  spanishString,
  englishString,
}: UseSearchByTextResultsParams) {
  const { searchExamplesByText } = useExampleAdapter();
  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['examples', 'by text', spanishString, englishString],
    queryFn: () =>
      searchExamplesByText(
        {
          spanishText: spanishString,
          englishText: englishString,
        },
        1,
        150,
      ),
  });

  return {
    examples: results,
    isLoading,
    error: error ?? null,
  };
}
