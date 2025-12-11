import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useSelectedExamplesContext } from '@application/coordinators/hooks/useSelectedExamplesContext';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export function SelectedExamples() {
  const { selectedExampleIds } = useSelectedExamplesContext();
  const queryClient = useQueryClient();

  // Search across all cached 'examples' queries to find selected examples
  const selectedExamples = useMemo(() => {
    if (selectedExampleIds.length === 0) return [];

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
  }, [selectedExampleIds, queryClient]);

  if (selectedExampleIds.length === 0) {
    return null;
  }

  return (
    <div>
      <h3>{selectedExampleIds.length} Selected Examples</h3>
      <BaseResultsComponent
        examples={selectedExamples}
        isLoading={false}
        error={null}
      />
    </div>
  );
}
