import type { CreateExampleRecord } from '@LearnCraft-Spanish/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useExamplesAdapter } from 'src/hexagon/application/adapters/examplesAdapter';
import { queryDefaults } from 'src/hexagon/application/utils/queryUtils';

export function useUnverifiedExamples() {
  const adapter = useExamplesAdapter();

  const queryClient = useQueryClient();

  // Query for fetching unverified examples
  const unverifiedExamplesQuery = useQuery({
    queryKey: ['unverifiedExamples'],
    queryFn: () => adapter.getUnverifiedExamples(),
    ...queryDefaults.entityData,
  });

  // I dont know if this is the right pattern, copying from useVocabulary.ts
  const unverifiedExampleMutation = useMutation({
    mutationFn: adapter.createUnverifiedExample,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unverifiedExample'] });
    },
  });

  async function createUnverifiedExample(example: CreateExampleRecord) {
    await unverifiedExampleMutation.mutateAsync(example);
  }

  return {
    unverifiedExamplesQuery,
    createUnverifiedExample,
  };
}
