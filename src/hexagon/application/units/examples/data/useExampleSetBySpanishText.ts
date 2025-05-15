import { useExamplesAdapter } from '@application/adapters/examplesAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export function useExampleSetBySpanishText(spanishExamples: string[]) {
  const { getExampleSetBySpanishText } = useExamplesAdapter();

  return useQuery({
    queryKey: ['exampleSetBySpanishText'],
    queryFn: () => getExampleSetBySpanishText(spanishExamples),
    ...queryDefaults.referenceData,
    enabled: spanishExamples.length > 0,
  });
}
