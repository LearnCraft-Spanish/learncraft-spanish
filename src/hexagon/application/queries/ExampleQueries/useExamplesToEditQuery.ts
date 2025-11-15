import type { ExampleTechnical } from '@learncraft-spanish/shared';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export interface UseExamplesToEditQueryReturnType {
  examples: ExampleTechnical[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useExamplesToEditQuery = (ids: number[]) => {
  const { getExamplesForEditingByIds } = useExampleAdapter();
  const {
    data: examples,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['examples', 'to edit', ids],
    queryFn: () => getExamplesForEditingByIds(ids),
    ...queryDefaults.referenceData,
  });
  return { examples, isLoading, error };
};
