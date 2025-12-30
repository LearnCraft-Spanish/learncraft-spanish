import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export function useExamplesByRecentlyModified(
  page: number,
  limit: number,
  vocabularyComplete?: boolean,
) {
  const { getExamplesByRecentlyModified } = useExampleAdapter();
  const {
    data: examples,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'examples',
      'by recently modified',
      page,
      limit,
      vocabularyComplete,
    ],
    queryFn: () =>
      getExamplesByRecentlyModified(page, limit, vocabularyComplete),
    ...queryDefaults.referenceData,
  });
  return { examples, isLoading, error };
}
