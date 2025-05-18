import { useExamplesAdapter } from '@application/adapters/examplesAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export function useRecentlyEditedExamples() {
  const { getRecentlyEditedExamples } = useExamplesAdapter();

  const recentlyEditedExamplesQuery = useQuery({
    queryKey: ['recentlyEditedExamples'],
    queryFn: getRecentlyEditedExamples,
    ...queryDefaults.referenceData,
  });
  return {
    data: recentlyEditedExamplesQuery.data,
    isLoading: recentlyEditedExamplesQuery.isLoading,
    error: recentlyEditedExamplesQuery.error,
    refetch: recentlyEditedExamplesQuery.refetch,
  };
}
