import type { UpdateExampleRecord } from '@LearnCraft-Spanish/shared/dist/domain/examples/core-types';
import { useExamplesAdapter } from '@application/adapters/examplesAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useUpdateExampleFromQuery } from './useUpdateExampleFromQuery';

export function useRecentlyEditedExamples() {
  const { getRecentlyEditedExamples } = useExamplesAdapter();
  const { updateExampleFromQuery } = useUpdateExampleFromQuery();

  const recentlyEditedExamplesQuery = useQuery({
    queryKey: ['recentlyEditedExamples'],
    queryFn: getRecentlyEditedExamples,
    ...queryDefaults.referenceData,
  });

  const updateRecentlyEditedExample = useCallback(
    (example: UpdateExampleRecord, vocabIncluded: string[]) => {
      updateExampleFromQuery(
        example,
        vocabIncluded,
        recentlyEditedExamplesQuery,
      );
    },
    [updateExampleFromQuery, recentlyEditedExamplesQuery],
  );

  return {
    recentlyEditedExamplesQuery: {
      data: recentlyEditedExamplesQuery.data,
      isLoading: recentlyEditedExamplesQuery.isLoading,
      error: recentlyEditedExamplesQuery.error,
      refetch: recentlyEditedExamplesQuery.refetch,
    },
    updateRecentlyEditedExample,
  };
}
