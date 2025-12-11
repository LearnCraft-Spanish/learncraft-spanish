import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export interface UseExampleByIdsQueryReturnType {
  examples: ExampleWithVocabulary[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useExampleByIdsQuery = (ids: number[]) => {
  const { getExamplesByIds } = useExampleAdapter();
  const {
    data: examples,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['examples', 'byIds', ids],
    queryFn: () => getExamplesByIds(ids),
    ...queryDefaults.referenceData,
  });
  return { examples, isLoading, error };
};
