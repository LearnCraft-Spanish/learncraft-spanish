import type {
  ExampleTextSearch,
  ExampleWithVocabulary,
} from '@learncraft-spanish/shared';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

export interface UseSearchExamplesQueryReturnType {
  examples: ExampleWithVocabulary[] | undefined;
  isLoading: boolean;
  error: Error | null;
  page: number;
  changePage: (page: number) => void;
}

export const useSearchExamplesQuery = (
  searchText: ExampleTextSearch,
): UseSearchExamplesQueryReturnType => {
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(1);
  const changePage = useCallback((page: number) => {
    setPage(page);
  }, []);
  const { searchExamplesByText } = useExampleAdapter();
  const {
    data: examplesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['searchExamples', searchText, page, PAGE_SIZE],
    queryFn: () => searchExamplesByText(searchText, page, PAGE_SIZE),
    ...queryDefaults.referenceData,
  });

  const examples = useMemo(() => {
    return examplesResponse?.examples ?? undefined;
  }, [examplesResponse]);

  return {
    examples,
    isLoading,
    error,
    page,
    changePage,
  };
};
