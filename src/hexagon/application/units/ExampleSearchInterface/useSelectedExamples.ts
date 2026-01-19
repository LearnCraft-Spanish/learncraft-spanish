import type { ExampleWithVocabulary } from '@learncraft-spanish/shared/dist/domain/example/core-types';
import { useSelectedExamplesContext } from '@application/coordinators/hooks/useSelectedExamplesContext';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export function useSelectedExamples() {
  const { selectedExampleIds } = useSelectedExamplesContext();
  const queryClient = useQueryClient();
  const isFetchingExamples = useIsFetching({ queryKey: ['examples'] });

  // Search across all cached 'examples' queries to find selected examples
  const selectedExamples = useMemo(() => {
    if (selectedExampleIds.length === 0 || isFetchingExamples > 0) return [];

    const cachedQueries = queryClient.getQueriesData<
      { examples: ExampleWithVocabulary[] } | ExampleWithVocabulary[]
    >({
      queryKey: ['examples'],
    });

    return selectedExampleIds
      .map((id) => {
        for (const [, data] of cachedQueries) {
          if (Array.isArray(data)) {
            const found = data.find((ex) => ex.id === id);
            if (found) return found;
          } else {
            if (data && Array.isArray(data.examples)) {
              const found = data.examples.find((ex) => ex.id === id);
              if (found) return found;
            }
          }
        }
        return null;
      })
      .filter((ex): ex is ExampleWithVocabulary => ex !== null);
  }, [selectedExampleIds, queryClient, isFetchingExamples]);

  return {
    selectedExamples,
  };
}
