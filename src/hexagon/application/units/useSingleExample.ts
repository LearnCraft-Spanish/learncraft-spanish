import { useQuery } from '@tanstack/react-query';
import { useExamplesAdapter } from '../adapters/examplesAdapter';
import { queryDefaults } from '../utils/queryUtils';

export function useSingleExample(exampleId: number) {
  const { getExample } = useExamplesAdapter();

  return useQuery({
    queryKey: ['singleExample', exampleId],
    queryFn: () => getExample(exampleId),
    ...queryDefaults.referenceData,
  });
}
