import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { useQuery } from '@tanstack/react-query';

export interface UseSearchByIdsResultsParams {
  ids: number[];
}

export function useSearchByIdsResults({ ids }: UseSearchByIdsResultsParams) {
  const { getExamplesByIds } = useExampleAdapter();
  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['examples', 'by ids', ids],
    queryFn: () => getExamplesByIds(ids),
  });

  return {
    examples: results ?? undefined,
    isLoading,
    error: error ?? null,
  };
}
