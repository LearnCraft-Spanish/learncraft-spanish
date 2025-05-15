import { useExamplesAdapter } from '@application/adapters/examplesAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export function useRecentlyEditedExamples() {
  const { getRecentlyEditedExamples } = useExamplesAdapter();

  return useQuery({
    queryKey: ['recentlyEditedExamples'],
    queryFn: getRecentlyEditedExamples,
    ...queryDefaults.referenceData,
  });
}
