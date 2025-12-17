import type {
  ExampleTextSearch,
  ExampleWithVocabulary,
} from '@learncraft-spanish/shared';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export interface UseSearchExamplesQueryReturnType {
  examples: ExampleWithVocabulary[] | undefined;
  totalCount: number | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useSearchExamplesQuery = (
  searchText: ExampleTextSearch,
  page: number = 1,
  pageSize: number = 100,
): UseSearchExamplesQueryReturnType => {
  const { searchExamplesByText } = useExampleAdapter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['examples', 'by search text', searchText, page, pageSize],
    queryFn: () => searchExamplesByText(searchText, page, pageSize),
    ...queryDefaults.referenceData,
  });

  return {
    examples: data?.examples,
    totalCount: data?.totalCount,
    isLoading,
    error,
  };
};
