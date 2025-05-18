import { useQuery } from '@tanstack/react-query';
import { useExamplesAdapter } from 'src/hexagon/application/adapters/examplesAdapter';
import { queryDefaults } from 'src/hexagon/application/utils/queryUtils';

export default function useExampleSet(spanishText: string[]) {
  const adapter = useExamplesAdapter();

  const exampleSetQuery = useQuery({
    queryKey: ['singleExample', spanishText],
    queryFn: () => adapter.getExampleSetBySpanishText(spanishText),
    ...queryDefaults.referenceData,
  });

  return { exampleSetQuery };
}
